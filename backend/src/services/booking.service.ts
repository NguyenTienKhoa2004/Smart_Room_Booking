import db from '../config/database';
import { CreateBookingDTO, BookingResponse } from '../types/booking.types';
import { RoomService } from './room.service';
import { EmailService } from './email.service';
import { SSEService } from './sse.service';


export class BookingService {
    static async createBooking(data: CreateBookingDTO): Promise<BookingResponse> {
        const { room_id, title, start_time, end_time, user_id } = data;

        const start = new Date(start_time);
        const end = new Date(end_time);
        const now = new Date();

        if (start >= end) {
            throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
        }
        if (start < now) {
            throw new Error('Không thể đặt phòng trong quá khứ');
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            await client.query('SELECT 1 FROM rooms WHERE id = $1 FOR UPDATE', [room_id]);

            const checkQuery = `
            SELECT id FROM bookings 
            WHERE room_id = $1 
            AND start_time < $3 
            AND end_time > $2
        `;
            const existing = await client.query(checkQuery, [room_id, start_time, end_time]);

            if (existing.rows.length > 0) {
                throw new Error('Phòng đã có người đặt trong khoảng thời gian này');
            }

            const insertQuery = `
            INSERT INTO bookings (room_id, title, start_time, end_time, user_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, room_id, title, start_time, end_time, user_id, created_at
        `;
            const result = await client.query(insertQuery, [room_id, title, start_time, end_time, user_id]);

            await client.query('COMMIT');

            await RoomService.invalidateCache();

            const infoQuery = `
                SELECT u.email, r.name as room_name 
                FROM users u 
                JOIN rooms r ON r.id = $2
                WHERE u.id = $1
            `;
            const infoResult = await client.query(infoQuery, [user_id, room_id]);
            const { email, room_name } = infoResult.rows[0];

            const booking = result.rows[0];

            EmailService.sendBookingConfirmation(email, {
                roomName: room_name,
                startTime: start_time,
                endTime: end_time,
                title: title
            }).catch(err => console.error('Failed to send confirmation email:', err));

            SSEService.sendToUser(user_id, 'booking_confirmed', {
                message: `Booking for ${room_name} confirmed!`,
                booking
            });

            return booking;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getBookings(userId: number): Promise<BookingResponse[]> {
        const result = await db.query(
            'SELECT id, room_id, title, start_time, end_time, user_id, created_at FROM bookings WHERE user_id = $1',
            [userId]
        );
        return result.rows;
    }

    static async getBooking(id: number, userId: number): Promise<BookingResponse> {
        const result = await db.query(
            'SELECT id, room_id, title, start_time, end_time, user_id, created_at FROM bookings WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        if (result.rows.length === 0) {
            throw new Error('Booking not found');
        }
        return result.rows[0];
    }

    static async updateBooking(id: number, userId: number, data: CreateBookingDTO): Promise<BookingResponse> {
        const { room_id, title, start_time, end_time } = data;
        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start >= end) throw new Error('Start time must be before end time');
        if (start < new Date()) throw new Error('Cannot update booking to a past time');

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            await client.query('SELECT 1 FROM rooms WHERE id = $1 FOR UPDATE', [room_id]);

            const collisionCheck = await client.query(
                `SELECT id FROM bookings 
             WHERE room_id = $1 AND id != $2 
             AND start_time < $3 AND end_time > $4`,
                [room_id, id, end, start]
            );

            if (collisionCheck.rows.length > 0) {
                throw new Error('Room is already booked for this time period');
            }

            const result = await client.query(
                `UPDATE bookings SET room_id = $1, title = $2, start_time = $3, end_time = $4 
             WHERE id = $5 AND user_id = $6 
             RETURNING *`,
                [room_id, title, start_time, end_time, id, userId]
            );

            if (result.rows.length === 0) throw new Error('Booking not found or unauthorized');

            await client.query('COMMIT');

            await RoomService.invalidateCache();

            return result.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async deleteBooking(id: number, userId: number): Promise<BookingResponse> {
        const result = await db.query(
            'DELETE FROM bookings WHERE id = $1 AND user_id = $2 RETURNING id, room_id, title, start_time, end_time, user_id, created_at',
            [id, userId]
        );
        if (result.rows.length === 0) {
            throw new Error('Booking not found or unauthorized');
        }

        await RoomService.invalidateCache();

        return result.rows[0];
    }


}
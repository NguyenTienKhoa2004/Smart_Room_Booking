import db from '../config/database';
import { CreateBookingDTO, BookingResponse } from '../types/booking.types';
import { RoomService } from './room.service';


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

            const checkQuery = `
            SELECT id FROM bookings 
            WHERE room_id = $1 
            AND start_time < $3 
            AND end_time > $2
            FOR UPDATE
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

            // Invalidate room cache
            await RoomService.invalidateCache();

            return result.rows[0];

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

            const collisionCheck = await client.query(
                `SELECT id FROM bookings 
             WHERE room_id = $1 AND id != $2 
             AND start_time < $3 AND end_time > $4
             FOR UPDATE`,
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

            // Invalidate room cache
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

        // Invalidate room cache
        await RoomService.invalidateCache();

        return result.rows[0];
    }


}
import db from '../config/database';

export interface AdminBookingResponse {
    id: number;
    user_id: number;
    room_id: number;
    start_date: Date;
    end_date: Date;
    status: string;
    created_at: Date;
    updated_at: Date;
}

export class AdminBookingService {
    static async getAllBookings(page: number = 1, limit: number = 10): Promise<{
        bookings: AdminBookingResponse[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const offset = (page - 1) * limit;

        const countResult = await db.query('SELECT COUNT(*) FROM bookings');
        const total = parseInt(countResult.rows[0].count);

        const result = await db.query(
            `SELECT id, user_id, room_id, start_date, end_date, status, created_at, updated_at 
             FROM bookings 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            bookings: result.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}

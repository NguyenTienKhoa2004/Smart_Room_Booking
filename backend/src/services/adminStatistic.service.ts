import db from '../config/database';

export interface BookingStats {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    activeBookings: number;
    cancelledBookings: number;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    adminUsers: number;
}

export interface RoomStats {
    totalRooms: number;
    averageCapacity: number;
    mostBookedRooms: Array<{
        roomId: number;
        roomName: string;
        bookingCount: number;
    }>;
}

export class AdminStatisticService {
    static async getBookingStats(): Promise<BookingStats> {
        const query = `
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
                COUNT(*) FILTER (WHERE start_time > NOW() AND status != 'cancelled') as upcoming_bookings,
                COUNT(*) FILTER (WHERE end_time < NOW() AND status != 'cancelled') as completed_bookings,
                COUNT(*) FILTER (WHERE start_time <= NOW() AND end_time >= NOW() AND status != 'cancelled') as active_bookings
            FROM bookings
        `;

        const result = await db.query(query);
        const row = result.rows[0];

        return {
            totalBookings: parseInt(row.total_bookings),
            upcomingBookings: parseInt(row.upcoming_bookings),
            completedBookings: parseInt(row.completed_bookings),
            activeBookings: parseInt(row.active_bookings),
            cancelledBookings: parseInt(row.cancelled_bookings)
        };
    }

    static async getUserStats(): Promise<UserStats> {
        const query = `
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE is_banned = true) as banned_users,
                COUNT(*) FILTER (WHERE is_banned = false) as active_users,
                COUNT(*) FILTER (WHERE role = 'admin') as admin_users
            FROM users
        `;

        const result = await db.query(query);
        const row = result.rows[0];

        return {
            totalUsers: parseInt(row.total_users),
            activeUsers: parseInt(row.active_users),
            bannedUsers: parseInt(row.banned_users),
            adminUsers: parseInt(row.admin_users)
        };
    }

    static async getRoomStats(): Promise<RoomStats> {
        const countQuery = `
            SELECT 
                COUNT(*) as total_rooms,
                AVG(capacity) as avg_capacity
            FROM rooms
        `;

        const countResult = await db.query(countQuery);
        const countRow = countResult.rows[0];

        const topRoomsQuery = `
            SELECT r.id, r.name, COUNT(b.id) as booking_count
            FROM rooms r
            LEFT JOIN bookings b ON r.id = b.room_id
            GROUP BY r.id, r.name
            ORDER BY booking_count DESC
            LIMIT 5
        `;

        const topRoomsResult = await db.query(topRoomsQuery);

        return {
            totalRooms: parseInt(countRow.total_rooms),
            averageCapacity: Math.round(parseFloat(countRow.avg_capacity || '0') * 10) / 10,
            mostBookedRooms: topRoomsResult.rows.map(row => ({
                roomId: row.id,
                roomName: row.name,
                bookingCount: parseInt(row.booking_count)
            }))
        };
    }

    static async getDashboardStats() {
        const [bookingStats, userStats, roomStats] = await Promise.all([
            this.getBookingStats(),
            this.getUserStats(),
            this.getRoomStats()
        ]);

        return {
            bookings: bookingStats,
            users: userStats,
            rooms: roomStats
        };
    }
}

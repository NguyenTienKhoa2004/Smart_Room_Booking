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

type Granularity = 'daily' | 'weekly' | 'monthly';

interface BookingTrend {
    date: string;
    bookings: number;
    cancelled: number;
}

interface BookingTrendsParams {
    startDate?: Date;
    endDate?: Date;
    granularity?: Granularity;
}

export interface RoomHeatmap {
    hour: number;
    dayOfWeek: number;
    bookingCount: number;
}

export interface UserActivityMetrics {
    registrations: Array<{ date: string; count: number }>;
    topUsers: Array<{ userId: number; fullName: string; bookingCount: number }>;
    roleDistribution: Array<{ role: string; count: number }>;
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

    static async getBookingTrends({ startDate, endDate, granularity = 'daily' }: BookingTrendsParams = {}): Promise<BookingTrend[]> {
        const interval = granularity === 'daily' ? 'day' : granularity === 'weekly' ? 'week' : 'month';

        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const query = `
            WITH date_range AS (
                SELECT generate_series(
                    date_trunc('${interval}', $1::timestamp),
                    date_trunc('${interval}', $2::timestamp),
                    '1 ${interval}'::interval
                ) AS series_date
            )
            SELECT 
                dr.series_date as date,
                COUNT(b.id)::int as bookings,
                COUNT(b.id) FILTER (WHERE b.status = 'cancelled')::int as cancelled
            FROM date_range dr
            LEFT JOIN bookings b ON date_trunc('${interval}', b.created_at) = dr.series_date
            GROUP BY dr.series_date
            ORDER BY dr.series_date ASC
        `;

        const result = await db.query(query, [start, end]);

        return result.rows.map(row => ({
            date: row.date.toISOString(),
            bookings: row.bookings,
            cancelled: row.cancelled
        }));
    }

    static async getRoomUtilizationHeatmap(): Promise<RoomHeatmap[]> {
        const query = `
            SELECT 
                EXTRACT(DOW FROM start_time)::int as day_of_week,
                EXTRACT(HOUR FROM start_time)::int as hour,
                COUNT(*)::int as booking_count
            FROM bookings
            WHERE status != 'cancelled'
            GROUP BY day_of_week, hour
            ORDER BY day_of_week, hour
        `;

        const result = await db.query(query);

        return result.rows.map(row => ({
            hour: row.hour,
            dayOfWeek: row.day_of_week,
            bookingCount: row.booking_count
        }));
    }

    static async getUserActivityMetrics(): Promise<UserActivityMetrics> {
        const regQuery = `
            SELECT 
                date_trunc('day', created_at) as date,
                COUNT(*)::int as count
            FROM users
            WHERE created_at > NOW() - INTERVAL '30 days'
            GROUP BY date
            ORDER BY date ASC
        `;

        const topUsersQuery = `
            SELECT 
                u.id, 
                u.full_name, 
                COUNT(b.id)::int as booking_count
            FROM users u
            JOIN bookings b ON u.id = b.user_id
            WHERE b.status != 'cancelled'
            GROUP BY u.id, u.full_name
            ORDER BY booking_count DESC
            LIMIT 10
        `;

        const roleQuery = `
            SELECT role, COUNT(*)::int as count
            FROM users
            GROUP BY role
        `;

        const [regResult, topUsersResult, roleResult] = await Promise.all([
            db.query(regQuery),
            db.query(topUsersQuery),
            db.query(roleQuery)
        ]);

        return {
            registrations: regResult.rows.map(row => ({
                date: row.date.toISOString(),
                count: row.count
            })),
            topUsers: topUsersResult.rows.map(row => ({
                userId: row.id,
                fullName: row.full_name,
                bookingCount: row.booking_count
            })),
            roleDistribution: roleResult.rows.map(row => ({
                role: row.role,
                count: row.count
            }))
        };
    }
}

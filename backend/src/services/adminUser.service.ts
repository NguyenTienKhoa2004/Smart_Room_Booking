import db from '../config/database';
import { EmailService } from './email.service';

export interface AdminUserResponse {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_banned: boolean;
    created_at: Date;
    updated_at: Date;
}

export class AdminUserService {
    /**
     * Get all users with pagination
     */
    static async getAllUsers(page: number = 1, limit: number = 10): Promise<{
        users: AdminUserResponse[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await db.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        // Get paginated users
        const result = await db.query(
            `SELECT id, email, full_name, role, is_banned, created_at, updated_at 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            users: result.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get user by ID with full details
     */
    static async getUserById(userId: number): Promise<AdminUserResponse> {
        const result = await db.query(
            `SELECT id, email, full_name, role, is_banned, created_at, updated_at 
             FROM users 
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        return result.rows[0];
    }

    /**
     * Ban a user
     */
    static async banUser(userId: number): Promise<AdminUserResponse> {
        // Check if user exists
        const userCheck = await db.query('SELECT id, email, full_name, is_banned FROM users WHERE id = $1', [userId]);

        if (userCheck.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = userCheck.rows[0];

        if (user.is_banned) {
            throw new Error('User is already banned');
        }

        // Ban the user
        const result = await db.query(
            `UPDATE users 
             SET is_banned = true, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING id, email, full_name, role, is_banned, created_at, updated_at`,
            [userId]
        );

        // Send email notification
        try {
            await EmailService.sendBanNotification(user.email, user.full_name);
        } catch (error) {
            console.error('Failed to send ban notification email:', error);
            // Don't throw error, ban should still succeed even if email fails
        }

        return result.rows[0];
    }

    /**
     * Unban a user
     */
    static async unbanUser(userId: number): Promise<AdminUserResponse> {
        // Check if user exists
        const userCheck = await db.query('SELECT id, email, full_name, is_banned FROM users WHERE id = $1', [userId]);

        if (userCheck.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = userCheck.rows[0];

        if (!user.is_banned) {
            throw new Error('User is not banned');
        }

        // Unban the user
        const result = await db.query(
            `UPDATE users 
             SET is_banned = false, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING id, email, full_name, role, is_banned, created_at, updated_at`,
            [userId]
        );

        // Send email notification
        try {
            await EmailService.sendUnbanNotification(user.email, user.full_name);
        } catch (error) {
            console.error('Failed to send unban notification email:', error);
            // Don't throw error, unban should still succeed even if email fails
        }

        return result.rows[0];
    }

    /**
     * Get user statistics
     */
    static async getUserStats(): Promise<{
        totalUsers: number;
        bannedUsers: number;
        activeUsers: number;
        adminUsers: number;
    }> {
        const result = await db.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE is_banned = true) as banned_users,
                COUNT(*) FILTER (WHERE is_banned = false) as active_users,
                COUNT(*) FILTER (WHERE role = 'admin') as admin_users
            FROM users
        `);

        const stats = result.rows[0];

        return {
            totalUsers: parseInt(stats.total_users),
            bannedUsers: parseInt(stats.banned_users),
            activeUsers: parseInt(stats.active_users),
            adminUsers: parseInt(stats.admin_users),
        };
    }
}

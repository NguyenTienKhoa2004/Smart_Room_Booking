import { Request, Response } from 'express';
import { AdminUserService } from '../services/adminUser.service';

export class AdminUserController {
    static async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            if (page < 1 || limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
                });
            }
            const result = await AdminUserService.getAllUsers(page, limit);
            res.json({
                success: true,
                data: result,
                message: 'Users retrieved successfully',
            });
        } catch (error: any) {
            console.error('Error getting all users:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve users',
            });
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id as string);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID',
                });
            }
            const user = await AdminUserService.getUserById(userId);
            res.json({
                success: true,
                data: user,
                message: 'User retrieved successfully',
            });
        } catch (error: any) {
            console.error('Error getting user by ID:', error);
            if (error.message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve user',
            });
        }
    }

    static async banUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id as string);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID',
                });
            }
            if (req.user && req.user.userId === userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot ban yourself',
                });
            }

            const user = await AdminUserService.banUser(userId);
            res.json({
                success: true,
                data: user,
                message: 'User banned successfully',
            });
        } catch (error: any) {
            console.error('Error banning user:', error);
            if (error.message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.message === 'User is already banned') {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to ban user',
            });
        }
    }

    static async unbanUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id as string);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID',
                });
            }

            const user = await AdminUserService.unbanUser(userId);

            res.json({
                success: true,
                data: user,
                message: 'User unbanned successfully',
            });
        } catch (error: any) {
            console.error('Error unbanning user:', error);

            if (error.message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.message === 'User is not banned') {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to unban user',
            });
        }
    }

    static async getUserStats(req: Request, res: Response) {
        try {
            const stats = await AdminUserService.getUserStats();

            res.json({
                success: true,
                data: stats,
                message: 'User statistics retrieved successfully',
            });
        } catch (error: any) {
            console.error('Error getting user stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve user statistics',
            });
        }
    }
}

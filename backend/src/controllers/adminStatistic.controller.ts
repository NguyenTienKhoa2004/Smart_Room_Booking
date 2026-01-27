import { Request, Response } from 'express';
import { AdminStatisticService } from '../services/adminStatistic.service';

export class AdminStatisticController {
    static async getDashboardStats(req: Request, res: Response) {
        try {
            const stats = await AdminStatisticService.getDashboardStats();
            res.json({
                success: true,
                data: stats,
                message: 'Dashboard statistics retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve dashboard statistics'
            });
        }
    }

    static async getBookingStats(req: Request, res: Response) {
        try {
            const stats = await AdminStatisticService.getBookingStats();
            res.json({
                success: true,
                data: stats,
                message: 'Booking statistics retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error getting booking stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve booking statistics'
            });
        }
    }

    static async getUserStats(req: Request, res: Response) {
        try {
            const stats = await AdminStatisticService.getUserStats();
            res.json({
                success: true,
                data: stats,
                message: 'User statistics retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error getting user stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve user statistics'
            });
        }
    }

    static async getRoomStats(req: Request, res: Response) {
        try {
            const stats = await AdminStatisticService.getRoomStats();
            res.json({
                success: true,
                data: stats,
                message: 'Room statistics retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error getting room stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve room statistics'
            });
        }
    }
}

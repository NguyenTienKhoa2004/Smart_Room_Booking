import { Request, Response } from 'express';
import { AdminStatisticService } from '../services/adminStatistic.service';
import { logger } from '../config/logger';


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
            logger.error('Error getting dashboard stats:', error);
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
            logger.error('Error getting booking stats:', error);
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
            logger.error('Error getting user stats:', error);
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
            logger.error('Error getting room stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve room statistics'
            });
        }
    }

    static async getBookingTrends(req: Request, res: Response) {
        try {
            const { startDate, endDate, granularity } = req.query;
            const stats = await AdminStatisticService.getBookingTrends({
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                granularity: granularity as any
            });
            res.json({
                success: true,
                data: stats,
                message: 'Booking trends retrieved successfully'
            });
        } catch (error: any) {
            logger.error('Error getting booking trends:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve booking trends'
            });
        }
    }

    static async getRoomUtilizationHeatmap(req: Request, res: Response) {
        try {
            const stats = await AdminStatisticService.getRoomUtilizationHeatmap();
            res.json({
                success: true,
                data: stats,
                message: 'Room utilization heatmap retrieved successfully'
            });
        } catch (error: any) {
            logger.error('Error getting room heatmap:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve room utilization heatmap'
            });
        }
    }

    static async getUserActivityMetrics(req: Request, res: Response) {
        try {
            const stats = await AdminStatisticService.getUserActivityMetrics();
            res.json({
                success: true,
                data: stats,
                message: 'User activity metrics retrieved successfully'
            });
        } catch (error: any) {
            logger.error('Error getting user activity metrics:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve user activity metrics'
            });
        }
    }
}

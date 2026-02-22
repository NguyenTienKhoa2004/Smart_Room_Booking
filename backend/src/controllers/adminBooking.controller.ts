import { Request, Response } from 'express';
import { AdminBookingService } from '../services/adminBooking.service';
import { logger } from '../config/logger';


export class AdminBookingController {
    static async getAllBookings(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (page < 1 || limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
                });
            }

            const result = await AdminBookingService.getAllBookings(page, limit);

            res.json({
                success: true,
                data: result,
                message: 'Bookings retrieved successfully',
            });
        } catch (error: any) {
            logger.error('Error getting all bookings:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve bookings',
            });
        }
    }
}


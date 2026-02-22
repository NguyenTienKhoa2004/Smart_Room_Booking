import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { ValidationUtils } from '../utils/validation.utils';
import { getIO } from '../socket';
import { logger } from '../config/logger';


export class BookingController {
    static async createBooking(req: Request, res: Response): Promise<void> {
        try {
            const { room_id, title, start_time, end_time } = req.body;
            const user_id = req.user?.userId;

            if (!room_id || !title || !start_time || !end_time || !user_id) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID, title, start time, end time, and user ID are required',
                });
                return;
            }

            const result = await BookingService.createBooking({
                room_id,
                title,
                start_time,
                end_time,
                user_id,
            });

            getIO().emit('room_status_update', { room_id: result.room_id });

            res.status(201).json(result);
        } catch (error: any) {
            logger.error('Create booking error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create booking',
            });
        }
    }

    static async getBookings(req: Request, res: Response): Promise<void> {
        try {
            const user_id = req.user?.userId;
            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await BookingService.getBookings(user_id);
            res.status(200).json(result);
        } catch (error: any) {
            logger.error('Get bookings error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get bookings',
            });
        }
    }

    static async getBooking(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user_id = req.user?.userId;

            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            ValidationUtils.validateBookingId(id);

            const result = await BookingService.getBooking(Number(id), user_id);
            res.status(200).json(result);
        } catch (error: any) {
            logger.error('Get booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get booking',
            });
        }
    }

    static async updateBooking(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user_id = req.user?.userId;

            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            ValidationUtils.validateBookingId(id);
            const { room_id, title, start_time, end_time } = req.body;

            if (!room_id || !title || !start_time || !end_time) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID, title, start time, and end time are required',
                });
                return;
            }

            const oldBooking = await BookingService.getBooking(Number(id), user_id);

            const result = await BookingService.updateBooking(Number(id), user_id, {
                room_id,
                title,
                start_time,
                end_time,
                user_id,
            });

            if (oldBooking && oldBooking.room_id !== result.room_id) {
                getIO().emit('room_status_update', { room_id: oldBooking.room_id });
            }
            getIO().emit('room_status_update', { room_id: result.room_id });

            res.status(200).json(result);
        } catch (error: any) {
            logger.error('Update booking error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update booking',
            });
        }
    }

    static async deleteBooking(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user_id = req.user?.userId;

            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            ValidationUtils.validateBookingId(id);
            const result = await BookingService.deleteBooking(Number(id), user_id);
            getIO().emit('room_status_update', { room_id: result.room_id });
            res.status(200).json(result);
        } catch (error: any) {
            logger.error('Delete booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete booking',
            });
        }
    }
}
import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { ValidationUtils } from '../utils/validation.utils';

export class BookingController {
    // POST /api/bookings
    static async createBooking(req: Request, res: Response): Promise<void> {
        try {
            const { room_id, start_time, end_time } = req.body;
            const user_id = req.user?.userId;

            if (!room_id || !start_time || !end_time || !user_id) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID, start time, end time, and user ID are required',
                });
                return;
            }

            const result = await BookingService.createBooking({
                room_id,
                start_time,
                end_time,
                user_id,
            });

            res.status(201).json(result);
        } catch (error: any) {
            console.error('Create booking error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create booking',
            });
        }
    }

    // GET /api/bookings
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
            console.error('Get bookings error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get bookings',
            });
        }
    }

    // GET /api/bookings/:id
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
            console.error('Get booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get booking',
            });
        }
    }

    // PUT /api/bookings/:id
    static async updateBooking(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user_id = req.user?.userId;

            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            ValidationUtils.validateBookingId(id);
            const { room_id, start_time, end_time } = req.body;

            if (!room_id || !start_time || !end_time) {
                res.status(400).json({
                    success: false,
                    message: 'Room ID, start time, and end time are required',
                });
                return;
            }

            const result = await BookingService.updateBooking(Number(id), user_id, {
                room_id,
                start_time,
                end_time,
                user_id,
            });

            res.status(200).json(result);
        } catch (error: any) {
            console.error('Update booking error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update booking',
            });
        }
    }

    // DELETE /api/bookings/:id
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
            res.status(200).json(result);
        } catch (error: any) {
            console.error('Delete booking error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete booking',
            });
        }
    }
}
import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';

export class RoomController {
    static async getRooms(req: Request, res: Response): Promise<void> {
        try {
            const { capacity, floor, start_time, end_time } = req.query;
            const equipment = req.query.equipment ? (req.query.equipment as string).split(',') : undefined;

            const filters = {
                capacity: capacity ? Number(capacity) : undefined,
                floor: floor ? Number(floor) : undefined,
                equipment,
                start_time: start_time as string,
                end_time: end_time as string
            };

            const rooms = await RoomService.getAllRooms(filters);
            res.status(200).json({
                success: true,
                data: rooms
            });
        } catch (error: any) {
            console.error('Get rooms error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch rooms'
            });
        }
    }

    static async getAmenities(req: Request, res: Response): Promise<void> {
        try {
            const equipment = await RoomService.getAmenities();
            res.status(200).json({
                success: true,
                data: equipment
            });
        } catch (error: any) {
            console.error('Get equipment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch equipment'
            });
        }
    }
}

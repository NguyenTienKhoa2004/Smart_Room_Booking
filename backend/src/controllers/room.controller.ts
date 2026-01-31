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
    static async createRoom(req: Request, res: Response): Promise<void> {
        try {
            const room = await RoomService.createRoom(req.body);
            res.status(201).json({
                success: true,
                message: 'Room created successfully',
                data: room
            });
        } catch (error: any) {
            console.error('Create room error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create room'
            });
        }
    }

    static async deleteRoom(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await RoomService.deleteRoom(Number(id));
            res.status(200).json({
                success: true,
                message: 'Room deleted successfully'
            });
        } catch (error: any) {
            console.error('Delete room error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete room'
            });
        }
    }
}

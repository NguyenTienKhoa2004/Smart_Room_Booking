import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';
import { logger } from '../config/logger';


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
            logger.error('Get rooms error:', error);
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
            logger.error('Get equipment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch equipment'
            });
        }
    }
    static async createRoom(req: Request, res: Response): Promise<void> {
        try {
            const { name, capacity, floor, equipment, image_url, status } = req.body;

            if (!name || typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ success: false, message: 'Room name is required and must be a non-empty string.' });
                return;
            }

            if (!capacity || typeof capacity !== 'number' || capacity <= 0) {
                res.status(400).json({ success: false, message: 'Capacity must be a positive number.' });
                return;
            }

            if (!floor || typeof floor !== 'number' || floor < 1 || floor > 5) {
                res.status(400).json({ success: false, message: 'Floor must be a number between 1 and 5.' });
                return;
            }

            const existingRoom = await RoomService.getRoomByName(name.trim());
            if (existingRoom) {
                res.status(400).json({ success: false, message: 'Room name already exists.' });
                return;
            }

            const roomData = {
                name: name.trim(),
                capacity,
                floor,
                equipment,
                image_url,
                status
            };

            const room = await RoomService.createRoom(roomData);
            res.status(201).json({
                success: true,
                message: 'Room created successfully',
                data: room
            });
        } catch (error: any) {
            logger.error('Create room error:', error);
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
            logger.error('Delete room error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete room'
            });
        }
    }
}

import db from '../config/database';
import redis from '../config/redis';
import { Room, RoomFilter } from '../types/room.types';
import { logger } from '../config/logger';

const CACHE_TTL = 300;

export class RoomService {
    static async getAllRooms(filters: RoomFilter): Promise<Room[]> {
        let query = `
            SELECT r.*, 
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM bookings b 
                    WHERE b.room_id = r.id 
                    AND b.start_time < $2 
                    AND b.end_time > $1
                ) THEN 'reserved'
                ELSE 'available'
            END as status
            FROM rooms r
            WHERE 1=1
        `;

        const params: any[] = [];

        const now = new Date();
        const startTime = filters.start_time ? new Date(filters.start_time) : now;
        const endTime = filters.end_time ? new Date(filters.end_time) : new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

        params.push(startTime, endTime);
        let paramIndex = 3;

        if (filters.capacity) {
            query += ` AND r.capacity >= $${paramIndex}`;
            params.push(filters.capacity);
            paramIndex++;
        }

        if (filters.floor) {
            query += ` AND r.floor = $${paramIndex}`;
            params.push(filters.floor);
            paramIndex++;
        }

        if (filters.equipment && filters.equipment.length > 0) {
            query += ` AND r.equipment @> $${paramIndex}::text[]`;
            params.push(filters.equipment);
            paramIndex++;
        }
        if (filters.start_time && filters.end_time) {
            query += ` AND NOT EXISTS (
                SELECT 1 FROM bookings b 
                WHERE b.room_id = r.id 
                AND b.start_time < $2 
                AND b.end_time > $1
            )`;
        }

        query += ` ORDER BY r.name ASC`;

        const cacheKey = `rooms:available:${JSON.stringify(
            Object.fromEntries(Object.entries(filters).sort())
        )}`;
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const result = await db.query(query, params);
        const rooms: Room[] = result.rows;

        await redis.set(cacheKey, JSON.stringify(rooms), 'EX', CACHE_TTL);

        const pipeline = redis.pipeline();
        const roomIds = rooms.map((r) => r.id);
        for (const roomId of roomIds) {
            const trackingKey = `room_keys:${roomId}`;
            pipeline.sadd(trackingKey, cacheKey);
            pipeline.expire(trackingKey, CACHE_TTL + 10);
        }
        pipeline.exec().catch((err) => logger.error('Failed to track cache keys:', err));

        return rooms;
    }

    static async invalidateCache(roomId?: number): Promise<void> {
        if (roomId) {
            const trackingKey = `room_keys:${roomId}`;
            const keys = await redis.smembers(trackingKey);
            if (keys.length > 0) {
                const pipeline = redis.pipeline();
                pipeline.del(...keys);
                pipeline.del(trackingKey);
                await pipeline.exec();
            }
        } else {
            const keys = await redis.keys('rooms:available:*');
            if (keys.length > 0) {
                await redis.del(keys);
            }
            const trackingKeys = await redis.keys('room_keys:*');
            if (trackingKeys.length > 0) {
                await redis.del(trackingKeys);
            }
            await redis.del('rooms:amenities');
        }
    }

    static async getAmenities(): Promise<string[]> {
        const cacheKey = 'rooms:amenities';
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const query = `
            SELECT DISTINCT unnest(equipment) as amenity 
            FROM rooms 
            ORDER BY amenity ASC
        `;
        const result = await db.query(query);
        const amenities = result.rows.map(row => row.amenity);

        await redis.set(cacheKey, JSON.stringify(amenities), 'EX', 86400);

        return amenities;
    }
    static async getRoomByName(name: string): Promise<Room | null> {
        const query = 'SELECT * FROM rooms WHERE name = $1';
        const result = await db.query(query, [name]);
        return result.rows[0] || null;
    }

    static async createRoom(data: Partial<Room>): Promise<Room> {
        const query = `
            INSERT INTO rooms (name, capacity, floor, equipment, image_url, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            data.name,
            data.capacity,
            data.floor,
            data.equipment || [],
            data.image_url,
            data.status || 'available'
        ];

        const result = await db.query(query, values);
        await this.invalidateCache();
        return result.rows[0];
    }

    static async deleteRoom(id: number): Promise<void> {
        const query = 'DELETE FROM rooms WHERE id = $1';
        await db.query(query, [id]);
        await this.invalidateCache();
    }
}

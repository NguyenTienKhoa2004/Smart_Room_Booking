import db from '../config/database';
import { Room, RoomFilter } from '../types/room.types';

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

        // Default time check to "now" if not provided, to determine status
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
            // Assuming equipment is a TEXT[] column in Postgres
            query += ` AND r.equipment @> $${paramIndex}::text[]`;
            params.push(filters.equipment);
            paramIndex++;
        }

        // Add proper handling for time filtering to exclude booked rooms if desired
        // But the requirement says "filter the available room", so we should strictly filter out
        if (filters.start_time && filters.end_time) {
            query += ` AND NOT EXISTS (
                SELECT 1 FROM bookings b 
                WHERE b.room_id = r.id 
                AND b.start_time < $2 
                AND b.end_time > $1
            )`;
        }

        query += ` ORDER BY r.name ASC`;

        const result = await db.query(query, params);
        return result.rows;
    }

    static async getAmenities(): Promise<string[]> {
        // Query to get distinct equipment. 
        // If equipment is an array column, we unnest it.
        const query = `
            SELECT DISTINCT unnest(equipment) as amenity 
            FROM rooms 
            ORDER BY amenity ASC
        `;
        const result = await db.query(query);
        return result.rows.map(row => row.amenity);
    }
}

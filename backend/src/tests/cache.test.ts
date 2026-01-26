import { RoomService } from '../services/room.service';
import redis from '../config/redis';
import db from '../config/database';

// Mock Redis
jest.mock('../config/redis', () => {
    return {
        __esModule: true,
        default: {
            get: jest.fn(),
            set: jest.fn(),
            keys: jest.fn(),
            del: jest.fn(),
            on: jest.fn(),
        },
    };
});

// Mock Database
jest.mock('../config/database', () => {
    return {
        __esModule: true,
        default: {
            query: jest.fn(),
        },
    };
});

describe('RoomService Caching', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return cached data if available', async () => {
        const filters = { capacity: 10 };
        const cachedData = [{ id: 1, name: 'Room 1' }];

        // Mock redis.get to return cached data
        (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

        const result = await RoomService.getAllRooms(filters);

        expect(redis.get).toHaveBeenCalledTimes(1);
        expect(redis.get).toHaveBeenCalledWith(expect.stringContaining('rooms:available'));
        expect(db.query).not.toHaveBeenCalled();
        expect(result).toEqual(cachedData);
    });

    it('should query db and cache result if no cache', async () => {
        const filters = { capacity: 10 };
        const dbData = { rows: [{ id: 1, name: 'Room 1' }] };

        // Mock redis.get to return null (cache miss)
        (redis.get as jest.Mock).mockResolvedValue(null);
        // Mock db.query to return data
        (db.query as jest.Mock).mockResolvedValue(dbData);

        const result = await RoomService.getAllRooms(filters);

        expect(redis.get).toHaveBeenCalled();
        expect(db.query).toHaveBeenCalled();

        // Verify cache is set
        expect(redis.set).toHaveBeenCalledWith(
            expect.stringContaining('rooms:available'),
            JSON.stringify(dbData.rows),
            'EX',
            300
        );
        expect(result).toEqual(dbData.rows);
    });

    it('should invalidate cache correctly', async () => {
        // Mock redis.keys to find keys
        (redis.keys as jest.Mock).mockResolvedValue(['rooms:available:1', 'rooms:available:2']);

        await RoomService.invalidateCache();

        expect(redis.keys).toHaveBeenCalledWith('rooms:available:*');
        expect(redis.del).toHaveBeenCalledWith(['rooms:available:1', 'rooms:available:2']);
    });

    it('should handle empty cache invalidation gracefully', async () => {
        // Mock redis.keys to return empty array
        (redis.keys as jest.Mock).mockResolvedValue([]);

        await RoomService.invalidateCache();

        expect(redis.keys).toHaveBeenCalledWith('rooms:available:*');
        expect(redis.del).not.toHaveBeenCalled();
    });
});

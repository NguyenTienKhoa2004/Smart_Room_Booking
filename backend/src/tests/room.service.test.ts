import db from '../config/database';
import { RoomService } from '../services/room.service';

jest.mock('../config/database', () => ({
    query: jest.fn(),
    connect: jest.fn()
}));

describe('RoomService Filtering', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllRooms', () => {
        it('should fetch rooms with capacity filter', async () => {
            const mockRooms = [
                { id: 1, name: 'Room 1', capacity: 10, floor: 1, equipment: ['TV'], status: 'available' }
            ];
            (db.query as jest.Mock).mockResolvedValue({ rows: mockRooms });

            const filters = { capacity: 5 };
            const result = await RoomService.getAllRooms(filters);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('AND r.capacity >= $3'),
                expect.arrayContaining([5])
            );
            expect(result).toEqual(mockRooms);
        });

        it('should fetch rooms with floor filter', async () => {
            (db.query as jest.Mock).mockResolvedValue({ rows: [] });

            const filters = { floor: 2 };
            await RoomService.getAllRooms(filters);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('AND r.floor = $3'),
                expect.arrayContaining([2])
            );
        });

        it('should fetch rooms with equipment filter', async () => {
            (db.query as jest.Mock).mockResolvedValue({ rows: [] });

            const filters = { equipment: ['Projector', 'WiFi'] };
            await RoomService.getAllRooms(filters);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('AND r.equipment @> $3::text[]'),
                expect.arrayContaining([['Projector', 'WiFi']])
            );
        });

        it('should fetch rooms with time availability filter', async () => {
            (db.query as jest.Mock).mockResolvedValue({ rows: [] });

            const startTime = '2026-02-01T10:00:00Z';
            const endTime = '2026-02-01T12:00:00Z';
            const filters = { start_time: startTime, end_time: endTime };

            await RoomService.getAllRooms(filters);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('NOT EXISTS'),
                expect.arrayContaining([new Date(startTime), new Date(endTime)])
            );
        });

        it('should fetch rooms with combined filters', async () => {
            (db.query as jest.Mock).mockResolvedValue({ rows: [] });

            const filters = {
                capacity: 10,
                floor: 1,
                equipment: ['TV'],
                start_time: '2026-02-01T10:00:00Z',
                end_time: '2026-02-01T12:00:00Z'
            };

            await RoomService.getAllRooms(filters);

            const lastCall = (db.query as jest.Mock).mock.calls[0];
            const queryStr = lastCall[0];
            const params = lastCall[1];

            expect(queryStr).toContain('r.capacity >= $3');
            expect(queryStr).toContain('r.floor = $4');
            expect(queryStr).toContain('r.equipment @> $5::text[]');
            expect(queryStr).toContain('NOT EXISTS');

            expect(params).toHaveLength(5);
            expect(params).toContain(10);
            expect(params).toContain(1);
            expect(params).toContainEqual(['TV']);
        });
    });

    describe('getAmenities', () => {
        it('should return distinct equipment list', async () => {
            const mockAmenities = [
                { amenity: 'TV' },
                { amenity: 'Projector' }
            ];
            (db.query as jest.Mock).mockResolvedValue({ rows: mockAmenities });

            const result = await RoomService.getAmenities();

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT unnest(equipment)'));
            expect(result).toEqual(['TV', 'Projector']);
        });
    });
});

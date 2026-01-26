import { BookingService } from '../services/booking.service';
import db from '../config/database';

jest.mock('../config/database');

describe('BookingService Logic and Ownership', () => {
    const userId = 1;
    const roomId = 1;
    const bookingId = 100;

    let mockClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        (db.connect as jest.Mock).mockResolvedValue(mockClient);
    });

    describe('createBooking', () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 1);
        const endDate = new Date(futureDate);
        endDate.setHours(endDate.getHours() + 1);

        const createData = {
            room_id: roomId,
            start_time: futureDate,
            title: 'Booking Test',
            end_time: endDate,
            user_id: userId
        };

        it('should create booking successfully', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
            mockClient.query.mockResolvedValueOnce({ rows: [] }); // Overlap check
            mockClient.query.mockResolvedValueOnce({
                rows: [{ id: bookingId, ...createData, created_at: new Date() }]
            }); // Insert
            mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

            const result = await BookingService.createBooking(createData);

            expect(result.id).toBe(bookingId);
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('BEGIN'));
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('FOR UPDATE'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('COMMIT'));
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should throw error if start time is after end time', async () => {
            const invalidData = { ...createData, start_time: endDate, end_time: futureDate };
            await expect(BookingService.createBooking(invalidData))
                .rejects.toThrow('Thời gian kết thúc phải sau thời gian bắt đầu');
        });

        it('should throw error if start time is in the past', async () => {
            const pastDate = new Date();
            pastDate.setFullYear(pastDate.getFullYear() - 1);
            const invalidData = { ...createData, start_time: pastDate };
            await expect(BookingService.createBooking(invalidData))
                .rejects.toThrow('Không thể đặt phòng trong quá khứ');
        });

        it('should throw error if room is already booked (overlap)', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [{ id: 99 }] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            await expect(BookingService.createBooking(createData))
                .rejects.toThrow('Phòng đã có người đặt trong khoảng thời gian này');

            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('ROLLBACK'));
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe('getBookings', () => {
        it('should filter bookings by user ID', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1, user_id: userId }] });

            const result = await BookingService.getBookings(userId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE user_id = $1'),
                [userId]
            );
            expect(result).toHaveLength(1);
        });
    });

    describe('updateBooking', () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 1);
        const endDate = new Date(futureDate);
        endDate.setHours(endDate.getHours() + 1);

        const updateData = {
            room_id: roomId,
            start_time: futureDate,
            title: 'Booking Test',
            end_time: endDate,
            user_id: userId
        };

        it('should update booking successfully', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({
                rows: [{ id: bookingId, ...updateData }]
            }); // Update
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            const result = await BookingService.updateBooking(bookingId, userId, updateData);

            expect(result.id).toBe(bookingId);
            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE bookings'),
                expect.any(Array)
            );
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should throw error if unauthorized or not found', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            await expect(BookingService.updateBooking(bookingId, userId, updateData))
                .rejects.toThrow('Booking not found or unauthorized');
        });
    });

    describe('deleteBooking', () => {
        it('should delete booking if owned by user', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: bookingId }] });

            const result = await BookingService.deleteBooking(bookingId, userId);

            expect(result.id).toBe(bookingId);
        });
    });
});

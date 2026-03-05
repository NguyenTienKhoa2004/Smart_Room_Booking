import request from 'supertest';
import express from 'express';
import { BookingController } from '../controllers/booking.controller';
import { BookingService } from '../services/booking.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/booking.service');
jest.mock('../config/logger', () => ({
    logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));
jest.mock('../socket', () => ({
    getIO: () => ({ emit: jest.fn() }),
}));

// ─── Mini Express app (bypass auth middleware để test controller trực tiếp) ──

function buildApp(userId?: number) {
    const app = express();
    app.use(express.json());

    // Giả lập middleware authenticate: inject user vào req
    app.use((req: any, _res: any, next: any) => {
        if (userId !== undefined) req.user = { userId };
        next();
    });

    app.post('/bookings', BookingController.createBooking);
    app.get('/bookings', BookingController.getBookings);
    app.get('/bookings/:id', BookingController.getBooking);
    app.put('/bookings/:id', BookingController.updateBooking);
    app.delete('/bookings/:id', BookingController.deleteBooking);

    return app;
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_BOOKING = {
    id: 1,
    room_id: 10,
    title: 'Team Meeting',
    start_time: new Date(Date.now() + 3600_000).toISOString(),
    end_time: new Date(Date.now() + 7200_000).toISOString(),
    user_id: 42,
    created_at: new Date().toISOString(),
};

const VALID_BODY = {
    room_id: 10,
    title: 'Team Meeting',
    start_time: new Date(Date.now() + 3600_000).toISOString(),
    end_time: new Date(Date.now() + 7200_000).toISOString(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BookingController', () => {
    beforeEach(() => jest.clearAllMocks());

    // ── POST /bookings ─────────────────────────────────────────────────────────

    describe('POST /bookings (createBooking)', () => {
        it('should return 201 and booking data on success', async () => {
            (BookingService.createBooking as jest.Mock).mockResolvedValue(MOCK_BOOKING);

            const res = await request(buildApp(42))
                .post('/bookings')
                .send(VALID_BODY);

            expect(res.status).toBe(201);
            expect(res.body.id).toBe(MOCK_BOOKING.id);
            expect(BookingService.createBooking).toHaveBeenCalledWith(
                expect.objectContaining({ room_id: 10, user_id: 42 })
            );
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(buildApp(42))
                .post('/bookings')
                .send({ title: 'No times or room' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(BookingService.createBooking).not.toHaveBeenCalled();
        });

        it('should return 400 if user_id is missing (not authenticated)', async () => {
            // buildApp without userId → req.user undefined
            const res = await request(buildApp())
                .post('/bookings')
                .send(VALID_BODY);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 if service throws (e.g. room conflict)', async () => {
            (BookingService.createBooking as jest.Mock).mockRejectedValue(
                new Error('Phòng đã có người đặt trong khoảng thời gian này')
            );

            const res = await request(buildApp(42))
                .post('/bookings')
                .send(VALID_BODY);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Phòng đã có người đặt trong khoảng thời gian này');
        });

        it('should return 400 if Redis lock busy', async () => {
            (BookingService.createBooking as jest.Mock).mockRejectedValue(
                new Error('Hệ thống đang bận xử lý giao dịch cho phòng này, vui lòng thử lại sau giây lát')
            );

            const res = await request(buildApp(42))
                .post('/bookings')
                .send(VALID_BODY);

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('vui lòng thử lại');
        });
    });

    // ── GET /bookings ──────────────────────────────────────────────────────────

    describe('GET /bookings (getBookings)', () => {
        it('should return 200 and list of bookings', async () => {
            (BookingService.getBookings as jest.Mock).mockResolvedValue([MOCK_BOOKING]);

            const res = await request(buildApp(42)).get('/bookings');

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(BookingService.getBookings).toHaveBeenCalledWith(42);
        });

        it('should return 401 if no user', async () => {
            const res = await request(buildApp()).get('/bookings');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(BookingService.getBookings).not.toHaveBeenCalled();
        });
    });

    // ── GET /bookings/:id ──────────────────────────────────────────────────────

    describe('GET /bookings/:id (getBooking)', () => {
        it('should return 200 and single booking', async () => {
            (BookingService.getBooking as jest.Mock).mockResolvedValue(MOCK_BOOKING);

            const res = await request(buildApp(42)).get('/bookings/1');

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(MOCK_BOOKING.id);
            expect(BookingService.getBooking).toHaveBeenCalledWith(1, 42);
        });

        it('should return 401 if no user', async () => {
            const res = await request(buildApp()).get('/bookings/1');

            expect(res.status).toBe(401);
        });

        it('should return 500 if service throws (booking not found)', async () => {
            (BookingService.getBooking as jest.Mock).mockRejectedValue(
                new Error('Booking not found')
            );

            const res = await request(buildApp(42)).get('/bookings/999');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Booking not found');
        });
    });

    // ── PUT /bookings/:id ──────────────────────────────────────────────────────

    describe('PUT /bookings/:id (updateBooking)', () => {
        it('should return 200 and updated booking', async () => {
            (BookingService.getBooking as jest.Mock).mockResolvedValue(MOCK_BOOKING);
            (BookingService.updateBooking as jest.Mock).mockResolvedValue({
                ...MOCK_BOOKING,
                title: 'Updated Meeting',
            });

            const res = await request(buildApp(42))
                .put('/bookings/1')
                .send(VALID_BODY);

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Updated Meeting');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(buildApp(42))
                .put('/bookings/1')
                .send({ title: 'Only title' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(BookingService.updateBooking).not.toHaveBeenCalled();
        });

        it('should return 401 if no user', async () => {
            const res = await request(buildApp()).put('/bookings/1').send(VALID_BODY);

            expect(res.status).toBe(401);
        });

        it('should return 400 if booking not found or unauthorized', async () => {
            (BookingService.getBooking as jest.Mock).mockResolvedValue(MOCK_BOOKING);
            (BookingService.updateBooking as jest.Mock).mockRejectedValue(
                new Error('Booking not found or unauthorized')
            );

            const res = await request(buildApp(42))
                .put('/bookings/999')
                .send(VALID_BODY);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Booking not found or unauthorized');
        });
    });

    // ── DELETE /bookings/:id ───────────────────────────────────────────────────

    describe('DELETE /bookings/:id (deleteBooking)', () => {
        it('should return 200 and deleted booking', async () => {
            (BookingService.deleteBooking as jest.Mock).mockResolvedValue({
                ...MOCK_BOOKING,
                status: 'cancelled',
            });

            const res = await request(buildApp(42)).delete('/bookings/1');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('cancelled');
            expect(BookingService.deleteBooking).toHaveBeenCalledWith(1, 42);
        });

        it('should return 401 if no user', async () => {
            const res = await request(buildApp()).delete('/bookings/1');

            expect(res.status).toBe(401);
        });

        it('should return 500 if booking not found or not owned by user', async () => {
            (BookingService.deleteBooking as jest.Mock).mockRejectedValue(
                new Error('Booking not found or unauthorized')
            );

            const res = await request(buildApp(42)).delete('/bookings/999');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Booking not found or unauthorized');
        });
    });
});

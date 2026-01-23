import request from 'supertest';
import app from '../app';
import db from '../config/database';
import { AuthUtils } from '../utils/auth.utils';

// Mock the database
jest.mock('../config/database');

describe('Booking API Integration Tests', () => {
    const userId = 1;
    const otherUserId = 2;
    const roomId = 10;
    const token = AuthUtils.generateAccessToken({ userId, email: 'user1@example.com', role: 'user' });
    const otherToken = AuthUtils.generateAccessToken({ userId: otherUserId, email: 'user2@example.com', role: 'user' });

    let mockClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        (db.connect as jest.Mock).mockResolvedValue(mockClient);
    });

    describe('POST /api/bookings', () => {
        const futureStart = new Date();
        futureStart.setHours(futureStart.getHours() + 2);
        const futureEnd = new Date(futureStart);
        futureEnd.setHours(futureEnd.getHours() + 1);

        it('should create a booking successfully', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({
                rows: [{ id: 1, room_id: roomId, user_id: userId }]
            });
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    room_id: roomId,
                    start_time: futureStart.toISOString(),
                    end_time: futureEnd.toISOString()
                });

            expect(res.status).toBe(201);
            expect(res.body.user_id).toBe(userId);
        });

        it('should fail if unauthorized', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .send({ room_id: roomId, start_time: '...', end_time: '...' });

            expect(res.status).toBe(401);
        });

        it('should fail if room is occupied (Pessimistic Lock Check)', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [{ id: 99 }] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    room_id: roomId,
                    start_time: futureStart.toISOString(),
                    end_time: futureEnd.toISOString()
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Phòng đã có người đặt');
        });
    });

    describe('PUT /api/bookings/:id', () => {
        it('should fail if trying to update someone else\'s booking', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .put('/api/bookings/100')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    room_id: roomId,
                    start_time: new Date(Date.now() + 3600000).toISOString(),
                    end_time: new Date(Date.now() + 7200000).toISOString()
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('unauthorized');
        });
    });
});

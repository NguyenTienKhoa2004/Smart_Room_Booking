import request from 'supertest';
import app from '../app';
import { UserService } from '../services/user.service';
import { AuthUtils } from '../utils/auth.utils';

jest.mock('../services/user.service');

describe('AuthController', () => {
    const mockAuthResponse = {
        success: true,
        data: {
            user: { id: 1, email: 'test@example.com', full_name: 'Test', role: 'user' },
            accessToken: 'mockAccess',
            refreshToken: 'mockRefresh'
        },
        message: 'Success'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should return 201 on successful registration', async () => {
            (UserService.register as jest.Mock).mockResolvedValue(mockAuthResponse);

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123', full_name: 'Test' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe('test@example.com');
        });

        it('should return 400 on service error', async () => {
            (UserService.register as jest.Mock).mockRejectedValue(new Error('Registration failed'));

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123', full_name: 'Test' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Registration failed');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should return 200 and set cookie on successful login', async () => {
            (UserService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.data.accessToken).toBe('mockAccess');
            expect(res.get('Set-Cookie')).toBeDefined();
        });

        it('should return 401 on invalid credentials', async () => {
            (UserService.login as jest.Mock).mockRejectedValue(new Error('Invalid email or password'));

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrong' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should clear the refreshToken cookie', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.status).toBe(200);
            const cookies = res.get('Set-Cookie');
            expect(cookies).toBeDefined();
            if (cookies && cookies.length > 0) {
                expect(cookies[0]).toMatch(/refreshToken=;/);
            }
        });
    });
});

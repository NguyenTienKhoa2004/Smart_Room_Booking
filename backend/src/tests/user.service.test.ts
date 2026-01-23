import { UserService } from '../services/user.service';
import db from '../config/database';
import { AuthUtils } from '../utils/auth.utils';

jest.mock('../config/database');
jest.mock('../utils/auth.utils');

describe('UserService', () => {
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: 'hashedPassword',
        role: 'user',
        created_at: new Date()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerData = {
            email: 'new@example.com',
            password: 'password123',
            full_name: 'New User'
        };

        it('should register a new user successfully', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            (AuthUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');

            (db.query as jest.Mock).mockResolvedValueOnce({
                rows: [{ ...mockUser, email: 'new@example.com', full_name: 'New User' }]
            });

            (AuthUtils.generateAccessToken as jest.Mock).mockReturnValue('mockAccessToken');
            (AuthUtils.generateRefreshToken as jest.Mock).mockReturnValue('mockRefreshToken');

            const result = await UserService.register(registerData);

            expect(result.success).toBe(true);
            expect(result.data.user.email).toBe('new@example.com');
            expect(result.data.accessToken).toBe('mockAccessToken');
            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('should throw error if email already exists', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });

            await expect(UserService.register(registerData)).rejects.toThrow('Email already registered');
        });

        it('should throw error for invalid email', async () => {
            await expect(UserService.register({ ...registerData, email: 'invalid' })).rejects.toThrow('Invalid email format');
        });
    });

    describe('login', () => {
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };

        it('should login successfully with correct credentials', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

            (AuthUtils.comparePassword as jest.Mock).mockResolvedValue(true);

            (AuthUtils.generateAccessToken as jest.Mock).mockReturnValue('mockAccessToken');
            (AuthUtils.generateRefreshToken as jest.Mock).mockReturnValue('mockRefreshToken');

            const result = await UserService.login(loginData);

            expect(result.success).toBe(true);
            expect(result.data.accessToken).toBe('mockAccessToken');
            expect(AuthUtils.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password_hash);
        });

        it('should throw error if user not found', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            await expect(UserService.login(loginData)).rejects.toThrow('Invalid email or password');
        });

        it('should throw error for incorrect password', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
            (AuthUtils.comparePassword as jest.Mock).mockResolvedValue(false);

            await expect(UserService.login(loginData)).rejects.toThrow('Invalid email or password');
        });
    });
});

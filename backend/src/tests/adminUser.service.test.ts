import { AdminUserService } from '../services/adminUser.service';
import { EmailService } from '../services/email.service';
import db from '../config/database';

jest.mock('../config/database');
jest.mock('../services/email.service');

describe('AdminUserService', () => {
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        is_banned: false,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
    };

    const mockBannedUser = {
        ...mockUser,
        id: 2,
        email: 'banned@example.com',
        full_name: 'Banned User',
        is_banned: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return paginated users successfully', async () => {
            const mockUsers = [mockUser, mockBannedUser];

            (db.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // Count query
                .mockResolvedValueOnce({ rows: mockUsers }); // Users query

            const result = await AdminUserService.getAllUsers(1, 10);

            expect(result.users).toEqual(mockUsers);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(1);
            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('should handle pagination correctly', async () => {
            (db.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [{ count: '25' }] })
                .mockResolvedValueOnce({ rows: [mockUser] });

            const result = await AdminUserService.getAllUsers(2, 10);

            expect(result.page).toBe(2);
            expect(result.totalPages).toBe(3);
            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                [10, 10] // limit, offset
            );
        });

        it('should use default pagination values', async () => {
            (db.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [{ count: '5' }] })
                .mockResolvedValueOnce({ rows: [mockUser] });

            const result = await AdminUserService.getAllUsers();

            expect(result.page).toBe(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                [10, 0] // default limit=10, offset=0
            );
        });
    });

    describe('getUserById', () => {
        it('should return user by ID successfully', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

            const result = await AdminUserService.getUserById(1);

            expect(result).toEqual(mockUser);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT id, email, full_name, role, is_banned'),
                [1]
            );
        });

        it('should throw error if user not found', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            await expect(AdminUserService.getUserById(999)).rejects.toThrow('User not found');
        });
    });

    describe('banUser', () => {
        it('should ban user successfully', async () => {
            const userToBan = { ...mockUser, is_banned: false };
            const bannedUser = { ...mockUser, is_banned: true };

            (db.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [userToBan] }) // Check user exists
                .mockResolvedValueOnce({ rows: [bannedUser] }); // Update user

            (EmailService.sendBanNotification as jest.Mock).mockResolvedValueOnce(undefined);

            const result = await AdminUserService.banUser(1);

            expect(result.is_banned).toBe(true);
            expect(db.query).toHaveBeenCalledTimes(2);
            expect(EmailService.sendBanNotification).toHaveBeenCalledWith(
                mockUser.email,
                mockUser.full_name
            );
        });

        it('should throw error if user not found', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            await expect(AdminUserService.banUser(999)).rejects.toThrow('User not found');
            expect(EmailService.sendBanNotification).not.toHaveBeenCalled();
        });

        it('should throw error if user is already banned', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockBannedUser] });

            await expect(AdminUserService.banUser(2)).rejects.toThrow('User is already banned');
            expect(EmailService.sendBanNotification).not.toHaveBeenCalled();
        });

        it('should still ban user even if email notification fails', async () => {
            const userToBan = { ...mockUser, is_banned: false };
            const bannedUser = { ...mockUser, is_banned: true };

            (db.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [userToBan] })
                .mockResolvedValueOnce({ rows: [bannedUser] });

            (EmailService.sendBanNotification as jest.Mock).mockRejectedValueOnce(
                new Error('Email service error')
            );

            const result = await AdminUserService.banUser(1);

            expect(result.is_banned).toBe(true);
            expect(EmailService.sendBanNotification).toHaveBeenCalled();
        });
    });

    describe('unbanUser', () => {
        it('should unban user successfully', async () => {
            const userToUnban = { ...mockUser, is_banned: true };
            const unbannedUser = { ...mockUser, is_banned: false };

            (db.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [userToUnban] }) // Check user exists
                .mockResolvedValueOnce({ rows: [unbannedUser] }); // Update user

            (EmailService.sendUnbanNotification as jest.Mock).mockResolvedValueOnce(undefined);

            const result = await AdminUserService.unbanUser(1);

            expect(result.is_banned).toBe(false);
            expect(db.query).toHaveBeenCalledTimes(2);
            expect(EmailService.sendUnbanNotification).toHaveBeenCalledWith(
                mockUser.email,
                mockUser.full_name
            );
        });

        it('should throw error if user not found', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            await expect(AdminUserService.unbanUser(999)).rejects.toThrow('User not found');
            expect(EmailService.sendUnbanNotification).not.toHaveBeenCalled();
        });

        it('should throw error if user is not banned', async () => {
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

            await expect(AdminUserService.unbanUser(1)).rejects.toThrow('User is not banned');
            expect(EmailService.sendUnbanNotification).not.toHaveBeenCalled();
        });

        it('should still unban user even if email notification fails', async () => {
            const userToUnban = { ...mockUser, is_banned: true };
            const unbannedUser = { ...mockUser, is_banned: false };

            (db.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [userToUnban] })
                .mockResolvedValueOnce({ rows: [unbannedUser] });

            (EmailService.sendUnbanNotification as jest.Mock).mockRejectedValueOnce(
                new Error('Email service error')
            );

            const result = await AdminUserService.unbanUser(1);

            expect(result.is_banned).toBe(false);
            expect(EmailService.sendUnbanNotification).toHaveBeenCalled();
        });
    });

    describe('getUserStats', () => {
        it('should return user statistics successfully', async () => {
            const mockStats = {
                total_users: '100',
                banned_users: '5',
                active_users: '95',
                admin_users: '3'
            };

            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockStats] });

            const result = await AdminUserService.getUserStats();

            expect(result).toEqual({
                totalUsers: 100,
                bannedUsers: 5,
                activeUsers: 95,
                adminUsers: 3
            });
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(*) FILTER')
            );
        });

        it('should handle zero users', async () => {
            const mockStats = {
                total_users: '0',
                banned_users: '0',
                active_users: '0',
                admin_users: '0'
            };

            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockStats] });

            const result = await AdminUserService.getUserStats();

            expect(result).toEqual({
                totalUsers: 0,
                bannedUsers: 0,
                activeUsers: 0,
                adminUsers: 0
            });
        });
    });

    describe('Error handling', () => {
        it('should handle database errors in getAllUsers', async () => {
            (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(AdminUserService.getAllUsers()).rejects.toThrow('Database error');
        });

        it('should handle database errors in getUserById', async () => {
            (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(AdminUserService.getUserById(1)).rejects.toThrow('Database error');
        });

        it('should handle database errors in banUser', async () => {
            (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(AdminUserService.banUser(1)).rejects.toThrow('Database error');
        });

        it('should handle database errors in unbanUser', async () => {
            (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(AdminUserService.unbanUser(1)).rejects.toThrow('Database error');
        });

        it('should handle database errors in getUserStats', async () => {
            (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(AdminUserService.getUserStats()).rejects.toThrow('Database error');
        });
    });
});

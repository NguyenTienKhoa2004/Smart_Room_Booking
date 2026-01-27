import { Request, Response } from 'express';
import { AdminUserController } from '../controllers/adminUser.controller';
import { AdminUserService } from '../services/adminUser.service';

jest.mock('../services/adminUser.service');

describe('AdminUserController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    const mockUser = {
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        is_banned: false,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
    };

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRequest = {
            params: {},
            query: {},
            user: undefined
        };

        mockResponse = {
            json: jsonMock,
            status: statusMock
        };

        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return paginated users successfully', async () => {
            const mockResult = {
                users: [mockUser],
                total: 1,
                page: 1,
                totalPages: 1
            };

            mockRequest.query = { page: '1', limit: '10' };
            (AdminUserService.getAllUsers as jest.Mock).mockResolvedValueOnce(mockResult);

            await AdminUserController.getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(AdminUserService.getAllUsers).toHaveBeenCalledWith(1, 10);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockResult,
                message: 'Users retrieved successfully'
            });
        });

        it('should use default pagination values', async () => {
            const mockResult = {
                users: [mockUser],
                total: 1,
                page: 1,
                totalPages: 1
            };

            (AdminUserService.getAllUsers as jest.Mock).mockResolvedValueOnce(mockResult);

            await AdminUserController.getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(AdminUserService.getAllUsers).toHaveBeenCalledWith(1, 10);
        });

        it('should return 400 for invalid page parameter', async () => {
            mockRequest.query = { page: '-1', limit: '10' };

            await AdminUserController.getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: expect.stringContaining('Invalid pagination parameters')
            });
            expect(AdminUserService.getAllUsers).not.toHaveBeenCalled();
        });


        it('should return 400 for limit exceeding maximum', async () => {
            mockRequest.query = { page: '1', limit: '101' };

            await AdminUserController.getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: expect.stringContaining('Invalid pagination parameters')
            });
        });

        it('should handle service errors', async () => {
            mockRequest.query = { page: '1', limit: '10' };
            (AdminUserService.getAllUsers as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            await AdminUserController.getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });
    });

    describe('getUserById', () => {
        it('should return user by ID successfully', async () => {
            mockRequest.params = { id: '1' };
            (AdminUserService.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

            await AdminUserController.getUserById(mockRequest as Request, mockResponse as Response);

            expect(AdminUserService.getUserById).toHaveBeenCalledWith(1);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
                message: 'User retrieved successfully'
            });
        });

        it('should return 400 for invalid user ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await AdminUserController.getUserById(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid user ID'
            });
        });

        it('should return 404 if user not found', async () => {
            mockRequest.params = { id: '999' };
            (AdminUserService.getUserById as jest.Mock).mockRejectedValueOnce(
                new Error('User not found')
            );

            await AdminUserController.getUserById(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should handle service errors', async () => {
            mockRequest.params = { id: '1' };
            (AdminUserService.getUserById as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            await AdminUserController.getUserById(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });
    });

    describe('banUser', () => {
        it('should ban user successfully', async () => {
            const bannedUser = { ...mockUser, is_banned: true };
            mockRequest.params = { id: '1' };
            mockRequest.user = { userId: 2, email: 'admin@example.com', role: 'admin' };

            (AdminUserService.banUser as jest.Mock).mockResolvedValueOnce(bannedUser);

            await AdminUserController.banUser(mockRequest as Request, mockResponse as Response);

            expect(AdminUserService.banUser).toHaveBeenCalledWith(1);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: bannedUser,
                message: 'User banned successfully'
            });
        });

        it('should return 400 for invalid user ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await AdminUserController.banUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid user ID'
            });
        });

        it('should return 403 if admin tries to ban themselves', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.user = { userId: 1, email: 'admin@example.com', role: 'admin' };

            await AdminUserController.banUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'You cannot ban yourself'
            });
            expect(AdminUserService.banUser).not.toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            mockRequest.params = { id: '999' };
            mockRequest.user = { userId: 2, email: 'admin@example.com', role: 'admin' };

            (AdminUserService.banUser as jest.Mock).mockRejectedValueOnce(
                new Error('User not found')
            );

            await AdminUserController.banUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should return 400 if user is already banned', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.user = { userId: 2, email: 'admin@example.com', role: 'admin' };

            (AdminUserService.banUser as jest.Mock).mockRejectedValueOnce(
                new Error('User is already banned')
            );

            await AdminUserController.banUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'User is already banned'
            });
        });

        it('should handle service errors', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.user = { userId: 2, email: 'admin@example.com', role: 'admin' };

            (AdminUserService.banUser as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            await AdminUserController.banUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });
    });

    describe('unbanUser', () => {
        it('should unban user successfully', async () => {
            const unbannedUser = { ...mockUser, is_banned: false };
            mockRequest.params = { id: '1' };

            (AdminUserService.unbanUser as jest.Mock).mockResolvedValueOnce(unbannedUser);

            await AdminUserController.unbanUser(mockRequest as Request, mockResponse as Response);

            expect(AdminUserService.unbanUser).toHaveBeenCalledWith(1);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: unbannedUser,
                message: 'User unbanned successfully'
            });
        });

        it('should return 400 for invalid user ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await AdminUserController.unbanUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid user ID'
            });
        });

        it('should return 404 if user not found', async () => {
            mockRequest.params = { id: '999' };
            (AdminUserService.unbanUser as jest.Mock).mockRejectedValueOnce(
                new Error('User not found')
            );

            await AdminUserController.unbanUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should return 400 if user is not banned', async () => {
            mockRequest.params = { id: '1' };
            (AdminUserService.unbanUser as jest.Mock).mockRejectedValueOnce(
                new Error('User is not banned')
            );

            await AdminUserController.unbanUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'User is not banned'
            });
        });

        it('should handle service errors', async () => {
            mockRequest.params = { id: '1' };
            (AdminUserService.unbanUser as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            await AdminUserController.unbanUser(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });
    });

    describe('getUserStats', () => {
        it('should return user statistics successfully', async () => {
            const mockStats = {
                totalUsers: 100,
                bannedUsers: 5,
                activeUsers: 95,
                adminUsers: 3
            };

            (AdminUserService.getUserStats as jest.Mock).mockResolvedValueOnce(mockStats);

            await AdminUserController.getUserStats(mockRequest as Request, mockResponse as Response);

            expect(AdminUserService.getUserStats).toHaveBeenCalled();
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockStats,
                message: 'User statistics retrieved successfully'
            });
        });

        it('should handle service errors', async () => {
            (AdminUserService.getUserStats as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            await AdminUserController.getUserStats(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });
    });
});

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthUtils } from '../utils/auth.utils';
import { logger } from '../config/logger';


export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, full_name } = req.body;

            if (!email || !password || !full_name) {
                res.status(400).json({
                    success: false,
                    message: 'Email, password, and full name are required',
                });
                return;
            }

            const result = await UserService.register({ email, password, full_name });
            res.status(201).json(result);
        } catch (error: any) {
            logger.error('Register error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed',
            });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                });
                return;
            }

            const result = await UserService.login({ email, password });

            res.cookie('refreshToken', result.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                data: {
                    user: result.data.user,
                    accessToken: result.data.accessToken,
                },
                message: result.message,
            });
        } catch (error: any) {
            logger.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }

    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            const user = await UserService.getProfile(req.user.userId);
            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get profile',
            });
        }
    }

    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    userId: req.user.userId,
                    email: req.user.email,
                    role: req.user.role,
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to get current user',
            });
        }
    }

    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    message: 'Refresh token not found, please log in again',
                });
                return;
            }

            const decoded = AuthUtils.verifyRefreshToken(refreshToken);

            const user = await UserService.getUserById(decoded.userId);

            if (!user) {
                res.status(403).json({
                    success: false,
                    message: 'Invalid refresh token',
                });
                return;
            }

            const accessToken = AuthUtils.generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            const newRefreshToken = AuthUtils.generateRefreshToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                data: {
                    accessToken,
                },
                message: 'Access token refreshed successfully',
            });
        } catch (error: any) {
            logger.error('Refresh token error:', error);
            res.status(403).json({
                success: false,
                message: error.message || 'Failed to refresh token',
            });
        }
    }
    static async logout(req: Request, res: Response): Promise<void> {
        try {
            res.cookie('refreshToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: new Date(0),
            });
            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error: any) {
            logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Logout failed',
            });
        }
    }
}
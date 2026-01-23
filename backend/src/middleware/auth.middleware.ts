import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth.utils';
import { JWTPayload } from '../types/user.types';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = AuthUtils.extractToken(req.headers.authorization);

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const decoded = AuthUtils.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Admin access required',
        });
        return;
    }

    next();
};

// Optional authentication (don't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = AuthUtils.extractToken(req.headers.authorization);
        if (token) {
            const decoded = AuthUtils.verifyToken(token);
            req.user = decoded;
        }
    } catch (error) {
        // Ignore errors, just proceed without user
    }
    next();
};
import { Router, Request, Response, NextFunction } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { AuthUtils } from '../utils/auth.utils';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Specialized middleware for SSE to support token in query params
const sseAuthenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = AuthUtils.extractToken(req.headers.authorization);

        // If not in header, check query param (standard for EventSource)
        if (!token && req.query.token) {
            token = req.query.token as string;
        }

        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const decoded = AuthUtils.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

router.get('/subscribe', sseAuthenticate, (req, res) => {
    NotificationController.subscribe(req, res);
});

export default router;

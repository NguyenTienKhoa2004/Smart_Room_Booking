import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

router.get('/profile', authenticate, AuthController.getProfile);
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
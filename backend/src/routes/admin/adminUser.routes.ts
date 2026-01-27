import { Router } from 'express';
import { AdminUserController } from '../../controllers/adminUser.controller';

const router = Router();

router.get('/stats', AdminUserController.getUserStats);
router.get('/', AdminUserController.getAllUsers);
router.get('/:id', AdminUserController.getUserById);
router.put('/:id/ban', AdminUserController.banUser);
router.put('/:id/unban', AdminUserController.unbanUser);

export default router;


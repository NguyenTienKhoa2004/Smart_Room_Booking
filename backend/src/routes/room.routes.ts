import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public or Protected? Usually protected in a corporate app
router.get('/', authenticate, RoomController.getRooms);
router.get('/equipment', authenticate, RoomController.getAmenities);

export default router;

import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, RoomController.getRooms);
router.get('/equipment', authenticate, RoomController.getAmenities);

router.post('/', authenticate, authorizeAdmin, RoomController.createRoom);
router.delete('/:id', authenticate, authorizeAdmin, RoomController.deleteRoom);

export default router;

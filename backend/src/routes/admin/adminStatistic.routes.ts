import { Router } from 'express';
import { AdminStatisticController } from '../../controllers/adminStatistic.controller';

const router = Router();

router.get('/overview', AdminStatisticController.getDashboardStats);
router.get('/bookings', AdminStatisticController.getBookingStats);
router.get('/rooms', AdminStatisticController.getRoomStats);
router.get('/users', AdminStatisticController.getUserStats);

export default router;

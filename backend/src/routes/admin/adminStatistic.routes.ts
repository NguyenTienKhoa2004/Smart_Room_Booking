import { Router } from 'express';
import { AdminStatisticController } from '../../controllers/adminStatistic.controller';

const router = Router();

router.get('/overview', AdminStatisticController.getDashboardStats);
router.get('/bookings', AdminStatisticController.getBookingStats);
router.get('/rooms', AdminStatisticController.getRoomStats);
router.get('/users', AdminStatisticController.getUserStats);
router.get('/analytics/booking-trends', AdminStatisticController.getBookingTrends);
router.get('/analytics/room-heatmap', AdminStatisticController.getRoomUtilizationHeatmap);
router.get('/analytics/user-activity', AdminStatisticController.getUserActivityMetrics);

export default router;

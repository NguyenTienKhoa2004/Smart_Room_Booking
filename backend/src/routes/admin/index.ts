import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';
import adminUserRoutes from './adminUser.routes';
// import adminRoomRoutes from './adminRoom.routes';
// import adminBookingRoutes from './adminBooking.routes';
import adminStatisticRoutes from './adminStatistic.routes';
import adminUploadRoutes from './adminUpload.routes';

const router = Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.use('/users', adminUserRoutes);
router.use('/statistics', adminStatisticRoutes);
router.use('/upload', adminUploadRoutes);
// router.use('/rooms', adminRoomRoutes);
// router.use('/bookings', adminBookingRoutes);


export default router;
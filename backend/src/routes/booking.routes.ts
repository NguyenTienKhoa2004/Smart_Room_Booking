import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { BookingController } from '../controllers/booking.controller';

const router = Router();

router.post('/', authenticate, BookingController.createBooking);
router.get('/', authenticate, BookingController.getBookings);
router.get('/:id', authenticate, BookingController.getBooking);
router.put('/:id', authenticate, BookingController.updateBooking);
router.delete('/:id', authenticate, BookingController.deleteBooking);

export default router;
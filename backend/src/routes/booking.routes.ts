import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { BookingController } from '../controllers/booking.controller';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema, updateBookingSchema } from '../schemas/booking.schema';

const router = Router();

router.post('/', authenticate, validate(createBookingSchema), BookingController.createBooking);
router.get('/', authenticate, BookingController.getBookings);
router.get('/:id', authenticate, BookingController.getBooking);
router.put('/:id', authenticate, validate(updateBookingSchema), BookingController.updateBooking);
router.delete('/:id', authenticate, BookingController.deleteBooking);

export default router;
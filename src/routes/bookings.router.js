import { Router } from 'express';
import { addBooking, addServiceToBooking, getBookingById } from '../controllers/bookings.controller.js';


const router = Router();

// GET /api/bookings/:bid
router.get('/:bid', getBookingById);

// POST /api/bookings
router.post('/', addBooking);

//POST /api/bookings/:bid/services/:sid
router.post('/:bid/services/:sid', addServiceToBooking);

export default router;
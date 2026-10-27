import { Router } from 'express';
import {  createBooking, addServiceToBooking, getBookingById, getBookings } from '../controllers/bookings.controller.js';


const router = Router();

//GET /api/bookings
router.get('/', getBookings);

// GET /api/bookings/:bid
router.get('/:bid', getBookingById);

// POST /api/bookings
router.post('/', createBooking);

//POST /api/bookings/:bid/services/:sid
router.post('/:bid/services/:sid', addServiceToBooking);

export default router;
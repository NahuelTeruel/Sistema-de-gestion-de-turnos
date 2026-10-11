import { Router } from 'express';
import BookingManager from '../managers/BookingManager.js';

const router = Router();
const bookingManager = new BookingManager("./src/data/bookings.json");

const REQUIRED_FIELDS = ['clientName', 'clientEmail', 'date', 'time', 'status'];

// GET /api/bookings
router.get('/', async (req, res) => {
    const bookings = await bookingManager.getBookings();

    res.status(200).json({ status: 'success', payload: bookings });
});

// GET /api/bookings/:bid
router.get('/:bid', async (req, res) => {
    const booking = await bookingManager.getBookingById(req.params.bid);

    if (!booking) {
        return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
    }

    res.status(200).json({ status: 'success', payload: booking });
});

// POST /api/bookings
router.post('/', async (req, res) => {
    const missing = await REQUIRED_FIELDS.filter(
        field => req.body[field] === undefined || req.body[field] === ''
    );

    const { clientName, clientEmail, date, time, status } = req.body;

     if(!clientName || !clientEmail || !date || !time || !status ){
        return res.status(400).json({
            status: "error",
            message : "Faltan campos obligatorios"
        })
    }
    const newBooking = await bookingManager.addBooking({
        clientName, clientEmail, date, time, status
    });

    res.status(201).json({ 
        status: 'success',
        message: 'Reserva agregada correctamente',
        payload: newBooking });
});

// PUT /api/bookings/:bid
router.put('/:bid', (req, res) => {
    const updated = bookingManager.updateBooking(req.params.bid, req.body);

    if (!updated) {
        return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Reserva actualizada correctamente',
        payload: updated
    });
});

// DELETE /api/bookings/:bid
router.delete('/:bid', (req, res) => {
    const deleted = bookingManager.deleteBooking(req.params.bid);

    if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Reserva eliminada correctamente',
        payload: deleted
    });
});

export default router;
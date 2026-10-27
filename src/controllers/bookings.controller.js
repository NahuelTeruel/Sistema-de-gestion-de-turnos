import { bookingsService } from '../services/bookings.service.js';

// GET /api/bookings -- devuelve todas las reservas
export const getBookings = async (req, res) => {
    const bookings = await bookingsService.getBookings();
    res.status(200).json({ status: 'success', payload: bookings });
};


// GET /api/bookings/:bid
export const getBookingById = async (req, res) => {
    const booking = await bookingsService.getBookingById(req.params.bid);

    if (!booking) {
        return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
    }

    res.status(200).json({ status: 'success', payload: booking });
};


// POST /api/bookings
export const createBooking = async (req, res) => {
    try {
        const newBooking = await bookingsService.createBooking(req.body);

        return res.status(201).json({
            status: 'success',
            message: 'Reserva agregada correctamente',
            payload: newBooking
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({
                status: 'error',
                message: error.message
            });
        }

        throw error;
    }
};

// POST /api/bookings/:bid/services/:sid
export const addServiceToBooking = async (req, res) => {
    try {
        const { bid, sid } = req.params;
        const updatedBooking = await bookingsService.addServiceToBooking(bid, sid);

        res.status(200).json({
            status: 'success',
            message: 'Servicio agregado a la reserva',
            payload: updatedBooking
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
};

import BookingManager from '../managers/BookingManager.js';
import ServiceManager from '../managers/ServiceManager.js';

const bookingManager = new BookingManager("./src/data/bookings.json");
const serviceManager = new ServiceManager("./src/data/services.json");

const REQUIRED_FIELDS = ['clientName', 'clientEmail', 'date', 'time', 'status'];

// GET /api/bookings/:bid

export const getBookingById = async (req, res) => {
    const booking = await bookingManager.getBookingById(req.params.bid);

    if (!booking) {
        return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
    }

    res.status(200).json({ status: 'success', payload: booking });
};


// POST /api/bookings
export const addBooking = async (req, res) => {
    const missing = await REQUIRED_FIELDS.filter(
        field => req.body[field] === undefined || req.body[field] === ''
    );

    const { clientName, clientEmail, date, time, status } = req.body;

     if(!clientName || !clientEmail || !date || !time ){
        return res.status(400).json({
            status: "error",
            message : "Faltan campos obligatorios"
        })
    }
    const newBooking = await bookingManager.addBooking({
        clientName, clientEmail, date, time, status : status ?? 'pendiente'
    });

    res.status(201).json({ 
        status: 'success',
        message: 'Reserva agregada correctamente',
        payload: newBooking });
};

export const addServiceToBooking = async (req, res) => {
    try {
        const { bid, sid } = req.params;
        const updatedBooking = await bookingManager.addServiceToBooking(bid, sid, serviceManager);

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
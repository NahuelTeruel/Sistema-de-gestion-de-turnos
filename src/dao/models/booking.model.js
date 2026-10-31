import mongoose from 'mongoose';

// Subdocumento embebido: un servicio dentro de una reserva.
// _id: false evita que Mongo agregue un _id propio a cada ítem del array.
const bookingServiceSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true,
    },
    clientEmail: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: String,
        required: true,
        trim: true,
    },
    time: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        default: 'pendiente',
        trim: true,
    },
    services: {
        type: [bookingServiceSchema],
        default: [],
    },
},
{ timestamps: true }
);

export const bookingModel = mongoose.model('Booking', bookingSchema, 'bookings');

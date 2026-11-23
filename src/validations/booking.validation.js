import { z } from 'zod';
import { objectId, text } from './fields.js';

// Verifica que la fecha exista en el calendario (rechaza, por ejemplo, 2026-02-31).
const isValidDate = value => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
};

// Body de POST /api/bookings.
export const createBookingSchema = z.object({
    clientName: text('El nombre del cliente es obligatorio', 'El nombre del cliente debe ser un texto')
        .trim()
        .min(1, 'El nombre del cliente es obligatorio'),
    clientEmail: text('El email del cliente es obligatorio', 'El email del cliente debe ser un texto')
        .trim()
        .email('El email no tiene un formato válido'),
    date: text('La fecha es obligatoria', 'La fecha debe ser un texto')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD')
        .refine(isValidDate, 'La fecha no es válida'),
    time: text('La hora es obligatoria', 'La hora debe ser un texto')
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener el formato HH:mm'),
    status: z.enum(['pendiente', 'confirmada', 'cancelada'], {
        error: 'El estado debe ser pendiente, confirmada o cancelada'
    }).optional()
});

// Params de POST /api/bookings/:bid/services/:sid.
export const addServiceToBookingSchema = z.object({
    bid: objectId(
        'El id de la reserva es obligatorio',
        'El id de la reserva no es un ObjectId válido'
    ),
    sid: objectId(
        'El id del servicio es obligatorio',
        'El id del servicio no es un ObjectId válido'
    )
});

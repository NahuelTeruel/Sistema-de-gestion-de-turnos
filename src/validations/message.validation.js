import { z } from 'zod';
import { text } from './fields.js';

// Body de POST /api/messages.
export const createMessageSchema = z.object({
    user: text('El usuario es obligatorio', 'El usuario debe ser un texto')
        .trim()
        .min(1, 'El usuario es obligatorio'),
    message: text('El mensaje es obligatorio', 'El mensaje debe ser un texto')
        .trim()
        .min(1, 'El mensaje es obligatorio')
});

// Body de PUT /api/messages/:mid: todos los campos son opcionales,
// pero debe venir al menos uno para actualizar.
export const updateMessageSchema = createMessageSchema
    .partial()
    .refine(data => Object.keys(data).length > 0, {
        error: 'Debe enviar al menos un campo para actualizar'
    });

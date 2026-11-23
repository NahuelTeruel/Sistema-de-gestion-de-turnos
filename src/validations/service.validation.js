import { z } from 'zod';
import { number, text } from './fields.js';

// Body de POST /api/services.
export const createServiceSchema = z.object({
    name: text('El nombre es obligatorio', 'El nombre debe ser un texto')
        .trim()
        .min(2, 'El nombre es obligatorio'),
    description: text('La descripción es obligatoria', 'La descripción debe ser un texto')
        .trim()
        .min(5, 'La descripción es obligatoria'),
    duration: number('La duración es obligatoria', 'La duración debe ser un número')
        .int('La duración debe ser un número entero')
        .positive('La duración debe ser mayor a 0'),
    price: number('El precio es obligatorio', 'El precio debe ser un número')
        .min(0, 'El precio debe ser mayor o igual a 0'),
    category: text('La categoría es obligatoria', 'La categoría debe ser un texto')
        .trim()
        .min(1, 'La categoría es obligatoria'),
    available: z.boolean({
        error: issue => issue.input === undefined
            ? 'La disponibilidad es obligatoria'
            : 'La disponibilidad debe ser true o false'
    }).optional()
});

// Body de PUT /api/services/:sid: todos los campos son opcionales,
// pero debe venir al menos uno para actualizar.
export const updateServiceSchema = createServiceSchema
    .partial()
    .refine(data => Object.keys(data).length > 0, {
        error: 'Debe enviar al menos un campo para actualizar'
    });

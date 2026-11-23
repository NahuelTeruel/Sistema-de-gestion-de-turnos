import { createHttpError } from '../utils/errors.js';

// Ejecuta un schema de Zod y devuelve los datos limpios.
// Si la validación falla, lanza un 400 con el detalle de cada campo inválido.
export const validate = (schema, data) => {
    const result = schema.safeParse(data);

    if (!result.success) {
        const details = result.error.issues
            .map(issue => {
                const field = issue.path.join('.');
                return field ? `${field}: ${issue.message}` : issue.message;
            })
            .join('; ');

        throw createHttpError(400, `Datos inválidos: ${details}`);
    }

    return result.data;
};

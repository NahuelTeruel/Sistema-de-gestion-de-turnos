import { z } from 'zod';

// Mensaje distinto según falte el campo o tenga un tipo incorrecto.
export const text = (requiredMessage, typeMessage) => z.string({
    error: issue => issue.input === undefined ? requiredMessage : typeMessage
});

export const number = (requiredMessage, typeMessage) => z.number({
    error: issue => issue.input === undefined ? requiredMessage : typeMessage
});

// Id de MongoDB (ObjectId) expresado como string hexadecimal de 24 caracteres.
export const objectId = (requiredMessage, invalidMessage) => text(requiredMessage, invalidMessage)
    .regex(/^[0-9a-fA-F]{24}$/, invalidMessage);

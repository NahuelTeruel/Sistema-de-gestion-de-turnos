// Error con código HTTP para que el controller sepa cómo responder.
export const createHttpError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

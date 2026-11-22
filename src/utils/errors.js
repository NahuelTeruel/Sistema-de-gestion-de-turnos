// Error con código HTTP para que el controller sepa cómo responder.
export const createHttpError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

// Respuesta de error uniforme para los controllers.
export const handleControllerError = (res, error, fallbackMessage = 'Error interno del servidor') => {
    // Errores de negocio lanzados desde los services (400, 404, etc.).
    if (error.status) {
        return res.status(error.status).json({
            status: 'error',
            message: error.message
        });
    }

    // Id con formato inválido para MongoDB.
    if (error.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            message: 'Identificador inválido'
        });
    }

    // Datos que no cumplen el schema de Mongoose.
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }

    // Error inesperado: se registra y no se expone el detalle al cliente.
    console.error(error);

    return res.status(500).json({
        status: 'error',
        message: fallbackMessage
    });
};

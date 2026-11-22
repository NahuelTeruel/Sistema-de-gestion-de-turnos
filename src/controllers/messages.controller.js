import { messagesService } from '../services/messages.service.js';
import { handleControllerError } from '../utils/errors.js';

// GET /api/messages -- devuelve todos los mensajes
export const getMessages = async (req, res) => {
    try {
        const messages = await messagesService.getMessages();

        return res.status(200).json({
            status: 'success',
            payload: messages
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al obtener los mensajes');
    }
};

// GET /api/messages/:mid
export const getMessageById = async (req, res) => {
    try {
        const message = await messagesService.getMessageById(req.params.mid);

        if (!message) {
            return res.status(404).json({
                status: 'error',
                message: 'Mensaje no encontrado'
            });
        }

        return res.status(200).json({
            status: 'success',
            payload: message
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al obtener el mensaje');
    }
};

// POST /api/messages
export const createMessage = async (req, res) => {
    try {
        const newMessage = await messagesService.createMessage(req.body);

        return res.status(201).json({
            status: 'success',
            message: 'Mensaje agregado correctamente',
            payload: newMessage
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al crear el mensaje');
    }
};

// PUT /api/messages/:mid
export const updateMessage = async (req, res) => {
    try {
        const updated = await messagesService.updateMessage(req.params.mid, req.body);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Mensaje no encontrado'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Mensaje actualizado correctamente',
            payload: updated
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al actualizar el mensaje');
    }
};

// DELETE /api/messages/:mid
export const deleteMessage = async (req, res) => {
    try {
        const deleted = await messagesService.deleteMessage(req.params.mid);

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Mensaje no encontrado'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Mensaje eliminado correctamente',
            payload: deleted
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al eliminar el mensaje');
    }
};

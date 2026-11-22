import MessagesRepository from '../repositories/messages.repository.js';
import { createHttpError } from '../utils/errors.js';

// Reglas de negocio de mensajes.
class MessagesService {
    constructor(repository = new MessagesRepository()) {
        this.repository = repository;
    }

    async getMessages() {
        return this.repository.getAll();
    }

    async getMessageById(id) {
        return this.repository.getById(id);
    }

    async createMessage({ user, message } = {}) {
        if (!user || !message) {
            throw createHttpError(400, 'Faltan campos obligatorios');
        }

        return this.repository.create({ user, message });
    }

    async updateMessage(id, data) {
        return this.repository.update(id, data);
    }

    async deleteMessage(id) {
        return this.repository.delete(id);
    }
}

export const messagesService = new MessagesService();
export default messagesService;

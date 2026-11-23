import MessagesRepository from '../repositories/messages.repository.js';
import { createMessageSchema, updateMessageSchema } from '../validations/message.validation.js';
import { validate } from '../validations/validate.js';

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

    async createMessage(data = {}) {
        const validated = validate(createMessageSchema, data);

        return this.repository.create(validated);
    }

    async updateMessage(id, data = {}) {
        const validated = validate(updateMessageSchema, data);

        return this.repository.update(id, validated);
    }

    async deleteMessage(id) {
        return this.repository.delete(id);
    }
}

export const messagesService = new MessagesService();
export default messagesService;

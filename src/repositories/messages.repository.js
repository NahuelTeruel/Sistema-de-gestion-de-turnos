import MessagesDao from '../dao/messages.dao.js';

// Operaciones de acceso a datos de mensajes sobre el DAO.
class MessagesRepository {
    constructor(dao = new MessagesDao()) {
        this.dao = dao;
    }

    async getAll() {
        return this.dao.getAll();
    }

    async getById(id) {
        return this.dao.getById(id);
    }

    async create(data) {
        return this.dao.create(data);
    }

    async update(id, data) {
        return this.dao.update(id, data);
    }

    async delete(id) {
        return this.dao.delete(id);
    }
}

export default MessagesRepository;

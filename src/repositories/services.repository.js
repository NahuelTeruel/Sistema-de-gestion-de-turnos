import ServicesDao from '../dao/services.dao.js';

// Operaciones de acceso a datos de servicios sobre el DAO.
class ServicesRepository {
    constructor(dao = new ServicesDao()) {
        this.dao = dao;
    }

    async getAll(options = {}) {
        return this.dao.getAll(options);
    }

    async count(filter = {}) {
        return this.dao.count(filter);
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

export default ServicesRepository;

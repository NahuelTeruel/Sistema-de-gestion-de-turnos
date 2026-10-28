import ServicesDao from '../dao/services.dao.js';

// Operaciones de acceso a datos de servicios sobre el DAO.
class ServicesRepository {
    constructor(dao = new ServicesDao()) {
        this.dao = dao;
    }

    async getAll() {
        return this.dao.getAll();
    }

    async getById(id) {
        return this.dao.getById(id);
    }

    async create(service) {
        return this.dao.create(service);
    }

    async update(id, changes) {
        return this.dao.update(id, changes);
    }

    async delete(id) {
        return this.dao.delete(id);
    }
}

export default ServicesRepository;

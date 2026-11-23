import BookingsDao from '../dao/bookings.dao.js';

// Operaciones de acceso a datos de reservas sobre el DAO.
class BookingsRepository {
    constructor(dao = new BookingsDao()) {
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
}

export default BookingsRepository;

import BookingsDao from '../dao/bookings.dao.js';

// Operaciones de acceso a datos de reservas sobre el DAO.
class BookingsRepository {
    constructor(dao = new BookingsDao()) {
        this.dao = dao;
    }

    async getAll() {
        return this.dao.getAll();
    }

    async getAllWithServices() {
        return this.dao.getAllWithServices();
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

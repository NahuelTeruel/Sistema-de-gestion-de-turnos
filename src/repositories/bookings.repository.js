import BookingsDao from '../dao/bookings.dao.js';

// Operaciones de acceso a datos de reservas sobre el DAO.
class BookingsRepository {
    constructor(dao = new BookingsDao()) {
        this.dao = dao;
    }

    async getAll() {
        return this.dao.getAll();
    }

    async getById(id) {
        return this.dao.getById(id);
    }

    async create(booking) {
        return this.dao.create(booking);
    }

    async update(id, changes) {
        return this.dao.update(id, changes);
    }
}

export default BookingsRepository;

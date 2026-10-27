import BookingsDao from '../dao/bookings.dao.js';

// Operaciones de acceso a datos de reservas sobre el DAO.
class BookingsRepository {
    constructor(dao = new BookingsDao()) {
        this.dao = dao;
    }

    async findAll() {
        return this.dao.readAll();
    }

    async findById(id) {
        const bookings = await this.dao.readAll();
        return bookings.find(booking => String(booking.id) === String(id));
    }

    async create(booking) {
        const bookings = await this.dao.readAll();
        bookings.push(booking);
        await this.dao.writeAll(bookings);
        return booking;
    }

    async updateById(id, changes) {
        const bookings = await this.dao.readAll();
        const index = bookings.findIndex(booking => String(booking.id) === String(id));

        if (index === -1) return null;

        const updatedBooking = {
            ...bookings[index],
            ...changes
        };
        bookings[index] = updatedBooking;
        await this.dao.writeAll(bookings);
        return updatedBooking;
    }
}

export default BookingsRepository;

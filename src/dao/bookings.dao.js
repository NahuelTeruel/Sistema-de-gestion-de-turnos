import fs from 'fs/promises';
import config from '../config/config.js';

// DAO de reservas: única capa que conoce el medio de persistencia (archivo JSON).
// No contiene reglas de negocio ni validaciones del dominio.
class BookingsDao {
    constructor(filePath = config.data.bookings) {
        this.filePath = filePath;
    }

    async getAll() {
        const data = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(data); // json -> objeto
    }

    async getById(id) {
        const bookings = await this.getAll();
        return bookings.find(booking => String(booking.id) === String(id));
    }

    async create(booking) {
        const bookings = await this.getAll();
        bookings.push(booking);
        await this.#writeAll(bookings);
        return booking;
    }

    async update(id, changes) {
        const bookings = await this.getAll();
        const index = bookings.findIndex(booking => String(booking.id) === String(id));

        if (index === -1) return null;

        const updatedBooking = {
            ...bookings[index],
            ...changes
        };
        bookings[index] = updatedBooking;
        await this.#writeAll(bookings);
        return updatedBooking;
    }

    // Helper interno de persistencia: serializa el array completo en el archivo.
    async #writeAll(records) {
        await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    }
}

export default BookingsDao;

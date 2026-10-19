import cryto from 'crypto';
import fs from 'fs/promises';

class BookingManager {
    constructor(path) {
        this.path = path;
    }

    async #readBookings() {
            const data = await fs.readFile(this.path, 'utf-8');
                return JSON.parse(data) //json -> objeto
        }
    
    async #writeBookings(bookings) {
         await fs.writeFile(this.path, JSON.stringify(bookings, null, 2), 'utf-8');
    }

    //GET /api/bookings -- devuelve todas las reservas
    async getBookings() {
        const bookings = await this.#readBookings();
        return bookings;
    }
    
    //GET /api/bookings/:bid
    async getBookingById(id) {
        const bookings = await this.#readBookings();
        return bookings.find(booking => String(booking.id) === String(id));
    }
    //POST /api/bookings -- crea una reserva con los datos del cliente y la fecha/hora, y un array vacío de servicios
    async addBooking({clientName, clientEmail, date, time, status}) {
        const bookings = await this.#readBookings();
        const newBooking = {
            id: cryto.randomUUID(),
            clientName,
            clientEmail,
            date,
            time,
            status,
            services: []
        }
        bookings.push(newBooking);
        await this.#writeBookings(bookings);
        return newBooking;
    }

    //POST /api/bookings/:bid/services/:sid -- agrega un servicio a una reserva existente, validando que el servicio y la reserva existan

   async addServiceToBooking(bid, sid, serviceManager) {
        // Lanza error si el servicio no existe
        const service = await serviceManager.getServiceById(sid);
        if (!service) {
            const error = new Error('Servicio no encontrado');
            error.status = 404;
            throw error;
        }


        const bookings = await this.#readBookings();
        const booking = bookings.find(b => String(b.id) === String(bid));

        if (!booking) {
            const error = new Error('Reserva no encontrada');
            error.status = 404;
            throw error;
        }

        booking.services ??= [];

        // Se usa service.id para guardar el id con el mismo tipo que en services.json
        const existing = booking.services.find(s => String(s.service) === String(service.id));
        if (existing) {
            existing.quantity += 1;
        } else {
            booking.services.push({ service: service.id, quantity: 1 });
        }

        await this.#writeBookings(bookings);
        return booking;
    }
}
export default BookingManager;
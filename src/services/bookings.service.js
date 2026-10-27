import crypto from 'crypto';
import BookingsRepository from '../repositories/bookings.repository.js';
import { servicesService as defaultServicesService } from './services.service.js';
import { createHttpError } from '../utils/errors.js';

// Reglas de negocio de reservas.
class BookingsService {
    constructor({
        bookingsRepository = new BookingsRepository(),
        servicesService = defaultServicesService
    } = {}) {
        this.bookingsRepository = bookingsRepository;
        this.servicesService = servicesService;
    }

    async getBookings() {
        return this.bookingsRepository.findAll();
    }

    async getBookingById(id) {
        return this.bookingsRepository.findById(id);
    }

    async createBooking({ clientName, clientEmail, date, time, status }) {
        if (!clientName || !clientEmail || !date || !time) {
            throw createHttpError(400, 'Faltan campos obligatorios');
        }

        const newBooking = {
            id: crypto.randomUUID(),
            clientName,
            clientEmail,
            date,
            time,
            status: status ?? 'pendiente',
            services: []
        };

        return this.bookingsRepository.create(newBooking);
    }

    // Agrega un servicio a una reserva existente, validando que ambos existan.
    async addServiceToBooking(bid, sid) {
        const service = await this.servicesService.getServiceById(sid);
        if (!service) {
            throw createHttpError(404, 'Servicio no encontrado');
        }

        const booking = await this.bookingsRepository.findById(bid);
        if (!booking) {
            throw createHttpError(404, 'Reserva no encontrada');
        }

        booking.services ??= [];

        // Se usa service.id para guardar el id con el mismo tipo que en services.json
        const existingService = booking.services.find(
            item => String(item.service) === String(service.id)
        );

        if (existingService) {
            existingService.quantity += 1;
        } else {
            booking.services.push({ service: service.id, quantity: 1 });
        }

        return this.bookingsRepository.updateById(bid, { services: booking.services });
    }
}

export const bookingsService = new BookingsService();
export default bookingsService;

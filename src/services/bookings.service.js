import BookingsRepository from '../repositories/bookings.repository.js';
import { servicesService as defaultServicesService } from './services.service.js';
import { addServiceToBookingSchema, createBookingSchema } from '../validations/booking.validation.js';
import { validate } from '../validations/validate.js';
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
        return this.bookingsRepository.getAll();
    }

    async getBookingById(id) {
        return this.bookingsRepository.getById(id);
    }

    async createBooking(data = {}) {
        const validated = validate(createBookingSchema, data);

        const newBooking = {
            ...validated,
            status: validated.status ?? 'pendiente',
            services: []
        };

        return this.bookingsRepository.create(newBooking);
    }

    // Agrega un servicio a una reserva existente, validando que ambos existan.
    async addServiceToBooking(bid, sid) {
        const ids = validate(addServiceToBookingSchema, { bid, sid });

        const service = await this.servicesService.getServiceById(ids.sid);
        if (!service) {
            throw createHttpError(404, 'Servicio no encontrado');
        }

        const booking = await this.bookingsRepository.getById(ids.bid);
        if (!booking) {
            throw createHttpError(404, 'Reserva no encontrada');
        }

        booking.services ??= [];

        // getById devuelve los servicios populados, así que se compara por el _id.
        const existingService = booking.services.find(
            item => String(item.service?._id ?? item.service) === String(service._id)
        );

        if (existingService) {
            existingService.quantity += 1;
        } else {
            booking.services.push({ service: service._id, quantity: 1 });
        }

        // Antes de actualizar se guardan solo las referencias, no los documentos populados.
        const services = booking.services
            .map(item => ({
                service: item.service?._id ?? item.service,
                quantity: item.quantity
            }))
            .filter(item => item.service);

        return this.bookingsRepository.update(ids.bid, { services });
    }
}

export const bookingsService = new BookingsService();
export default bookingsService;

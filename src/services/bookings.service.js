import BookingsRepository from '../repositories/bookings.repository.js';
import { servicesService as defaultServicesService } from './services.service.js';
import { addServiceToBookingSchema, createBookingSchema } from '../validations/booking.validation.js';
import { validate } from '../validations/validate.js';
import { createHttpError } from '../utils/errors.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 100;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_ORDER = 'asc';

const SORTABLE_FIELDS = ['clientName', 'clientEmail', 'date', 'time', 'status', 'createdAt', 'updatedAt'];
const BOOKING_STATUSES = ['pendiente', 'confirmada', 'cancelada'];

const parsePositiveInt = (value, name, fallback) => {
    if (value === undefined || value === null || String(value).trim() === '') {
        return fallback;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
        throw createHttpError(400, `El parámetro "${name}" debe ser un entero mayor o igual a 1`);
    }

    return parsed;
};

// Reglas de negocio de reservas.
class BookingsService {
    constructor({
        bookingsRepository = new BookingsRepository(),
        servicesService = defaultServicesService
    } = {}) {
        this.bookingsRepository = bookingsRepository;
        this.servicesService = servicesService;
    }

    async getBookings(query = {}) {
        const { status, page, limit, sortBy, order } = query;
        const filter = {};

        if (status !== undefined && String(status).trim() !== '') {
            const normalizedStatus = String(status).trim().toLowerCase();

            if (!BOOKING_STATUSES.includes(normalizedStatus)) {
                throw createHttpError(400, `El parámetro "status" debe ser uno de: ${BOOKING_STATUSES.join(', ')}`);
            }

            filter.status = normalizedStatus;
        }

        const currentPage = parsePositiveInt(page, 'page', DEFAULT_PAGE);
        const pageLimit = parsePositiveInt(limit, 'limit', DEFAULT_LIMIT);

        if (pageLimit > MAX_LIMIT) {
            throw createHttpError(400, `El parámetro "limit" no puede superar ${MAX_LIMIT}`);
        }

        const sortField = sortBy !== undefined && String(sortBy).trim() !== ''
            ? String(sortBy).trim()
            : DEFAULT_SORT_BY;

        if (!SORTABLE_FIELDS.includes(sortField)) {
            throw createHttpError(400, `El parámetro "sortBy" debe ser uno de: ${SORTABLE_FIELDS.join(', ')}`);
        }

        const sortOrder = order !== undefined && String(order).trim() !== ''
            ? String(order).trim().toLowerCase()
            : DEFAULT_ORDER;

        if (sortOrder !== 'asc' && sortOrder !== 'desc') {
            throw createHttpError(400, 'El parámetro "order" debe ser "asc" o "desc"');
        }

        const total = await this.bookingsRepository.count(filter);
        const totalPages = total === 0 ? 0 : Math.ceil(total / pageLimit);

        const docs = await this.bookingsRepository.getAll({
            filter,
            sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 },
            skip: (currentPage - 1) * pageLimit,
            limit: pageLimit
        });

        return {
            docs,
            totalDocs: total,
            totalPages,
            page: currentPage,
            limit: pageLimit,
            hasPrevPage: currentPage > 1,
            hasNextPage: currentPage < totalPages,
            prevPage: currentPage > 1 ? currentPage - 1 : null,
            nextPage: currentPage < totalPages ? currentPage + 1 : null
        };
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

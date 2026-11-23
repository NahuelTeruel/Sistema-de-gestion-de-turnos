import ServicesRepository from '../repositories/services.repository.js';
import { createHttpError } from '../utils/errors.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_ORDER = 'asc';

// Campos por los que se permite ordenar: evita ordenar por claves internas o inexistentes.
const SORTABLE_FIELDS = ['name', 'price', 'duration', 'category', 'available', 'createdAt', 'updatedAt'];

// Escapa caracteres especiales para usar el texto dentro de una RegExp.
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Valida un query param numérico entero positivo. Si no viene, usa el valor por defecto.
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

// Reglas de negocio de servicios.
class ServicesService {
    constructor(repository = new ServicesRepository()) {
        this.repository = repository;
    }

    // query: { category, available, page, limit, sortBy, order } (viene de req.query, así que son strings)
    async getServices(query = {}) {
        const { category, available, page, limit, sortBy, order } = query;
        const filter = {};

        if (category !== undefined && String(category).trim() !== '') {
            // Búsqueda exacta por categoría, sin distinguir mayúsculas/minúsculas.
            filter.category = new RegExp(`^${escapeRegExp(String(category).trim())}$`, 'i');
        }

        if (available !== undefined && String(available).trim() !== '') {
            const normalizedAvailable = String(available).trim().toLowerCase();

            if (normalizedAvailable !== 'true' && normalizedAvailable !== 'false') {
                throw createHttpError(400, 'El parámetro "available" debe ser "true" o "false"');
            }

            filter.available = normalizedAvailable === 'true';
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

        const total = await this.repository.count(filter);
        const totalPages = total === 0 ? 0 : Math.ceil(total / pageLimit);

        const docs = await this.repository.getAll({
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

    async getServiceById(id) {
        return this.repository.getById(id);
    }

    async createService({ name, description, price, duration, category, available } = {}) {
        if (!name || !description || !duration || !price || !category) {
            throw createHttpError(400, 'Faltan campos obligatorios');
        }

        const newService = {
            name,
            description,
            price,
            duration,
            category,
            available: available ?? true
        };

        return this.repository.create(newService);
    }

    async updateService(id, data) {
        return this.repository.update(id, data);
    }

    async deleteService(id) {
        return this.repository.delete(id);
    }
}

export const servicesService = new ServicesService();
export default servicesService;

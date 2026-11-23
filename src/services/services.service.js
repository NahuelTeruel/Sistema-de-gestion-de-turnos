import ServicesRepository from '../repositories/services.repository.js';
import { createServiceSchema, updateServiceSchema } from '../validations/service.validation.js';
import { validate } from '../validations/validate.js';
import { createHttpError } from '../utils/errors.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 100;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_ORDER = 'asc';


const SORTABLE_FIELDS = ['name', 'price', 'duration', 'category', 'available', 'createdAt', 'updatedAt'];


const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


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

    
    async getServices(query = {}) {
        const { category, available, page, limit, sortBy, order } = query;
        const filter = {};

        if (category !== undefined && String(category).trim() !== '') {
            
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

    async createService(data = {}) {
        const validated = validate(createServiceSchema, data);

        const newService = {
            ...validated,
            available: validated.available ?? true
        };

        return this.repository.create(newService);
    }

    async updateService(id, data = {}) {
        const validated = validate(updateServiceSchema, data);

        return this.repository.update(id, validated);
    }

    async deleteService(id) {
        return this.repository.delete(id);
    }
}

export const servicesService = new ServicesService();
export default servicesService;

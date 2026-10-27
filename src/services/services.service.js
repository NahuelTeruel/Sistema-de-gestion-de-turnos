import crypto from 'crypto';
import ServicesRepository from '../repositories/services.repository.js';
import { createHttpError } from '../utils/errors.js';

// Reglas de negocio de servicios.
class ServicesService {
    constructor(repository = new ServicesRepository()) {
        this.repository = repository;
    }

    // filters: { category, available } (vienen de req.query, así que son strings)
    async getServices({ category, available } = {}) {
        let services = await this.repository.findAll();

        if (category !== undefined) {
            services = services.filter(
                service => service.category.toLowerCase() === String(category).toLowerCase()
            );
        }

        if (available !== undefined) {
            services = services.filter(
                service => String(service.available) === String(available).toLowerCase()
            );
        }

        return services;
    }

    async getServiceById(id) {
        return this.repository.findById(id);
    }

    async addService({ name, description, price, duration, category, available }) {
        if (!name || !duration || !price || !category) {
            throw createHttpError(400, 'Faltan campos obligatorios');
        }

        const newService = {
            id: crypto.randomUUID(),
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
        return this.repository.updateById(id, data);
    }

    async deleteService(id) {
        return this.repository.deleteById(id);
    }
}

export const servicesService = new ServicesService();
export default servicesService;

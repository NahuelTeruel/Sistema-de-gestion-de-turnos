import ServicesDao from '../dao/services.dao.js';

// Operaciones de acceso a datos de servicios sobre el DAO.
class ServicesRepository {
    constructor(dao = new ServicesDao()) {
        this.dao = dao;
    }

    async findAll() {
        return this.dao.readAll();
    }

    async findById(id) {
        const services = await this.dao.readAll();
        return services.find(service => String(service.id) === String(id));
    }

    async create(service) {
        const services = await this.dao.readAll();
        services.push(service);
        await this.dao.writeAll(services);
        return service;
    }

    async updateById(id, changes) {
        const services = await this.dao.readAll();
        const index = services.findIndex(service => String(service.id) === String(id));

        if (index === -1) return null;

        const updatedService = {
            ...services[index],
            ...changes
        };
        services[index] = updatedService;
        await this.dao.writeAll(services);
        return updatedService;
    }

    async deleteById(id) {
        const services = await this.dao.readAll();
        const index = services.findIndex(service => String(service.id) === String(id));

        if (index === -1) return null;

        const deletedService = services.splice(index, 1)[0];
        await this.dao.writeAll(services);
        return deletedService;
    }
}

export default ServicesRepository;

import fs from 'fs/promises';
import config from '../config/config.js';

// DAO de servicios: única capa que conoce el medio de persistencia (archivo JSON).
// No contiene reglas de negocio ni validaciones del dominio.
class ServicesDao {
    constructor(filePath = config.data.services) {
        this.filePath = filePath;
    }

    async getAll() {
        const data = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(data); // json -> objeto
    }

    async getById(id) {
        const services = await this.getAll();
        return services.find(service => String(service.id) === String(id));
    }

    async create(service) {
        const services = await this.getAll();
        services.push(service);
        await this.writeAll(services);
        return service;
    }

    async update(id, changes) {
        const services = await this.getAll();
        const index = services.findIndex(service => String(service.id) === String(id));

        if (index === -1) return null;

        const updatedService = {
            ...services[index],
            ...changes
        };
        services[index] = updatedService;
        await this.writeAll(services);
        return updatedService;
    }

    async delete(id) {
        const services = await this.getAll();
        const index = services.findIndex(service => String(service.id) === String(id));

        if (index === -1) return null;

        const deletedService = services.splice(index, 1)[0];
        await this.writeAll(services);
        return deletedService;
    }

    // Helper interno de persistencia: serializa el array completo en el archivo.
    async writeAll(records) {
        await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    }
}

export default ServicesDao;

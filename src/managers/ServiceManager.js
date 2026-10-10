import cryto from 'crypto';
import fs from 'fs/promises';

class ServiceManager {
    constructor(path) {
        this.path = path;
    }

    async #readServices() {
        const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data) //json -> objeto
    }

    
    async #writeServices(services) {
        await fs.writeFile(this.path, JSON.stringify(services, null, 2), 'utf-8');
    }

    //GET
    // filters: { category, available } (vienen de req.query, así que son strings)
    async getServices({ category, available } = {}) {
        let result = await this.#readServices();
 
        if (category !== undefined) {
            result = result.filter(
                service => service.category.toLowerCase() === String(category).toLowerCase()
            );
        }
        
        if (available !== undefined) {
            result = result.filter(
                service => String(service.available) === String(available).toLowerCase()
            );
        }
        
        return result;
    }
    //GET:ID
    async getServiceById(id) {
        const services = await this.#readServices();
        return services.find(service => String(service.id) === String(id));
    }
    //POST
    async addService({name, description, price, duration, category, available}) {
        const services = await this.#readServices();
        const newService = {
            id: cryto.randomUUID(),
            name,
            description,
            price,
            duration,
            category, 
            available 
        }
        services.push(newService);
        await this.#writeServices(services);
        return newService;
    }
    //PUT:ID
    async updateService(id, data) {
        const services = await this.#readServices();
        const index = services.findIndex(service => String(service.id) === String(id));
        if (index === -1) return null;
        const service = {
            ...services[index],
            ...data
        };
        services[index] = service;
        await this.#writeServices(services);
        return service;
    }
    //DELETE:ID
    async deleteService(id) {
        const services = await this.#readServices()
        const index = services.findIndex(service => String(service.id) === String(id));
        if (index === -1) return null;
        const deletedService = services.splice(index, 1)[0];
        await this.#writeServices(services);
        return deletedService;
    }
}

export default ServiceManager;
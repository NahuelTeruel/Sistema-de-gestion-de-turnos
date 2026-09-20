import cryto from 'crypto';

class ServiceManager {
    constructor() {
        this.services = [{"id": "1", "name": "Mesa", "description": "Artículo convencional", "price": 50, "category": "Home", "available": true}];
    }

    getServices() {
        return this.services;
    }

    getServiceById(id) {
        return this.services.find(service => service.id === id);
    }

    addService(name, description, price, category, available) {
        const newService = {
            id: cryto.randomUUID(),
            name,
            description,
            price,
            category, 
            available 
        }
        this.services.push(newService);
    }
    
    updateService(id, data) {
        let service = this.getServiceById(id);
        if (!service) return null;
        const index = this.services.findIndex(service => service.id === id)
        service = {
            ...service,
            ...data
        };
        this.services[index] = service;
        return service;
    }

    deleteService(id) {
        const index = this.services.findIndex(service => service.id === id);
        if (index === -1) return null
        return this.services.splice(index, 1)[0]
    }
}

const obj = new ServiceManager();
obj.addService("Clinico", "Tratamientos en gral", 100, "Medicina", true)

console.log(obj.getServices())
console.log(obj.getServiceById("1"))
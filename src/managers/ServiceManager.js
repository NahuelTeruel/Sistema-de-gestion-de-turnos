import cryto from 'crypto';

class ServiceManager {
    constructor() {
        this.services = [
    {
        id:1,
        name: "Consulta psicologica",
        description: "Servicio de consulta con un psicologo",
        price: 30000,
        duration:40,
        available:true,
        category: "psicología"
    },
    { 
        id:2,
        name: "Consulta medica",
        description: "Servicio de consulta con un medico clinico",
        price: 40000,
        duration:30,
        available:true,
        category: "especialistas"

    },
    {
        id:3,
        name: "Consulta dermatologica",
        description: "Servicio de consulta con un medico dermatologo",
        price: 45000,
        duration:30,
        available:true,
        category: "especialistas"
    }
]
    }

    // filters: { category, available } (vienen de req.query, así que son strings)
    getServices({ category, available } = {}) {
        const result = this.services;
 
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

export default ServiceManager;
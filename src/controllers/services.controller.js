import ServiceManager from '../managers/ServiceManager.js';

const serviceManager = new ServiceManager('./src/data/services.json');

const REQUIRED_FIELDS = ['name', 'price', 'duration', 'category'];

// GET /api/services?category=salud&available=true
export const getServices = async (req, res) => {
    try {
        const { category, available } = req.query;
        const services = await serviceManager.getServices({ category, available });
        return res.status(200).json({
            status: 'success',
             payload: services
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            status: 'error',
            payload: 'Error al obtener los servicios' });
    }
};

export const getServiceById = async (req, res) => {
    const service = await serviceManager.getServiceById(req.params.sid);

    if (!service) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({ status: 'success', payload: service });
};

export const addService = async (req, res) => {
    const missing = await REQUIRED_FIELDS.filter(
        field => req.body[field] === undefined || req.body[field] === ''
    );

    const { name, description, price, duration, available, category } = req.body;

     if(!name || !duration ||!price || !category ){
        return res.status(400).json({
            status: "error",
            message : "Faltan campos obligatorios"
        })
    }
    const newService = await serviceManager.addService({
        name, description, price, duration, category, available: available ?? true
    });

    res.status(201).json({ 
        status: 'success',
        message: 'Servicio agregado correctamente',
        payload: newService });
};

export const updateService = async (req, res) => {
    const updated = serviceManager.updateService(req.params.sid, req.body);

    if (!updated) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Servicio actualizado correctamente',
        payload: updated
    });
}

export const deleteService = async (req, res) => {
    const deleted = await serviceManager.deleteService(req.params.sid);

    if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Servicio eliminado correctamente',
        payload: deleted
    });
};
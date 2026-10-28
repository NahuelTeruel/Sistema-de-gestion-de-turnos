import { servicesService } from '../services/services.service.js';

// GET /api/services?category=salud&available=true
export const getServices = async (req, res) => {
    try {
        const { category, available } = req.query;
        const services = await servicesService.getServices({ category, available });
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
    const service = await servicesService.getServiceById(req.params.sid);

    if (!service) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({ status: 'success', payload: service });
};

export const createService = async (req, res) => {
    try {
        const newService = await servicesService.createService(req.body);

        return res.status(201).json({
            status: 'success',
            message: 'Servicio agregado correctamente',
            payload: newService
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({
                status: 'error',
                message: error.message
            });
        }

        throw error;
    }
};

export const updateService = async (req, res) => {
    const updated = await servicesService.updateService(req.params.sid, req.body);

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
    const deleted = await servicesService.deleteService(req.params.sid);

    if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Servicio eliminado correctamente',
        payload: deleted
    });
};

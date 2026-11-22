import { servicesService } from '../services/services.service.js';
import { handleControllerError } from '../utils/errors.js';

// GET /api/services?category=salud&available=true
export const getServices = async (req, res) => {
    try {
        const { category, available } = req.query;
        const services = await servicesService.getServices({ category, available });

        return res.status(200).json({
            status: 'success',
            payload: services
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al obtener los servicios');
    }
};

// GET /api/services/:sid
export const getServiceById = async (req, res) => {
    try {
        const service = await servicesService.getServiceById(req.params.sid);

        if (!service) {
            return res.status(404).json({
                status: 'error',
                message: 'Servicio no encontrado'
            });
        }

        return res.status(200).json({
            status: 'success',
            payload: service
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al obtener el servicio');
    }
};

// POST /api/services
export const createService = async (req, res) => {
    try {
        const newService = await servicesService.createService(req.body);

        return res.status(201).json({
            status: 'success',
            message: 'Servicio agregado correctamente',
            payload: newService
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al crear el servicio');
    }
};

// PUT /api/services/:sid
export const updateService = async (req, res) => {
    try {
        const updated = await servicesService.updateService(req.params.sid, req.body);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Servicio no encontrado'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Servicio actualizado correctamente',
            payload: updated
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al actualizar el servicio');
    }
};

// DELETE /api/services/:sid
export const deleteService = async (req, res) => {
    try {
        const deleted = await servicesService.deleteService(req.params.sid);

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Servicio no encontrado'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Servicio eliminado correctamente',
            payload: deleted
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error al eliminar el servicio');
    }
};

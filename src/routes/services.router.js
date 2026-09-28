import { Router } from 'express';
import ServiceManager from '../managers/ServiceManager.js';

const router = Router();
const serviceManager = new ServiceManager();

const REQUIRED_FIELDS = ['name', 'price', 'duration', 'category'];

// GET /api/services?category=salud&available=true
router.get('/', (req, res) => {
    const { category, available } = req.query;
    const services = serviceManager.getServices({ category, available });

    res.status(200).json({ status: 'success', payload: services });
});

// GET /api/services/:sid
router.get('/:sid', (req, res) => {
    const service = serviceManager.getServiceById(req.params.sid);

    if (!service) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({ status: 'success', payload: service });
});

// POST /api/services
router.post('/', (req, res) => {
    const missing = REQUIRED_FIELDS.filter(
        field => req.body[field] === undefined || req.body[field] === ''
    );

    if (missing.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: `Faltan datos obligatorios: ${missing.join(', ')}`
        });
    }

    // Se leen solo los campos permitidos: si viene un "id" en el body, se ignora
    const { name, description, price, duration, available, category } = req.body;
    const newService = serviceManager.addService({
        name, description, price, duration, available, category
    });

    res.status(201).json({ status: 'success', payload: newService });
});

// PUT /api/services/:sid
router.put('/:sid', (req, res) => {
    const updated = serviceManager.updateService(req.params.sid, req.body);

    if (!updated) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Servicio actualizado correctamente',
        payload: updated
    });
});

// DELETE /api/services/:sid
router.delete('/:sid', (req, res) => {
    const deleted = serviceManager.deleteService(req.params.sid);

    if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Servicio eliminado correctamente',
        payload: deleted
    });
});

export default router;
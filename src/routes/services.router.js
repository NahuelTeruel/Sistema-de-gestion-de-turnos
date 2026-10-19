import { Router } from 'express';
import { getServices, getServiceById, addService, updateService, deleteService } from '../controllers/services.controller.js';

const router = Router();

// GET /api/services?category=salud&available=true
router.get('/', getServices);

// GET /api/services/:sid
router.get('/:sid', getServiceById);

// POST /api/services
router.post('/', addService);

// PUT /api/services/:sid
router.put('/:sid', updateService);

// DELETE /api/services/:sid
router.delete('/:sid', deleteService);

export default router;
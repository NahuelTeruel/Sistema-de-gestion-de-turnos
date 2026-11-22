import { Router } from 'express';
import {
    getMessages,
    getMessageById,
    createMessage,
    updateMessage,
    deleteMessage
} from '../controllers/messages.controller.js';

const router = Router();

// GET /api/messages
router.get('/', getMessages);

// GET /api/messages/:mid
router.get('/:mid', getMessageById);

// POST /api/messages
router.post('/', createMessage);

// PUT /api/messages/:mid
router.put('/:mid', updateMessage);

// DELETE /api/messages/:mid
router.delete('/:mid', deleteMessage);

export default router;

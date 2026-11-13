import { Router } from 'express';
import { getHistory, getHistoryItem, deleteHistoryItem, getStats } from '../controllers/historyController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/', getHistory);
router.get('/:id', getHistoryItem);
router.delete('/:id', deleteHistoryItem);

export default router;

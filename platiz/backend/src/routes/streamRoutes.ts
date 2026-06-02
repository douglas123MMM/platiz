import { Router } from 'express';
import { getAllStreams, getStream, createStream, updateStream, deleteStream, toggleStreamActive, globalSearch, runMigrations } from '../controllers/streamController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllStreams);
router.get('/search', authenticate, requireAdmin, globalSearch);
router.post('/migrate', authenticate, requireAdmin, runMigrations);
router.get('/:id', authenticate, getStream);
router.post('/', authenticate, requireAdmin, createStream);
router.put('/:id', authenticate, requireAdmin, updateStream);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleStreamActive);
router.delete('/:id', authenticate, requireAdmin, deleteStream);

export default router;

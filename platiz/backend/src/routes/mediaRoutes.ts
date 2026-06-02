import { Router } from 'express';
import { getAllMedia, getAllMediaAdmin, getMediaByGenre, createMedia, updateMedia, deleteMedia, toggleMediaActive } from '../controllers/mediaController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

router.get('/', getAllMedia);
router.get('/admin', authenticate, requireAdmin, getAllMediaAdmin);
router.get('/genre/:genre', getMediaByGenre);
router.post('/', authenticate, requireAdmin, upload.single('image'), createMedia);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateMedia);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleMediaActive);
router.delete('/:id', authenticate, requireAdmin, deleteMedia);

export default router;

import { Router } from 'express';
import { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

router.get('/', getBanners);
router.get('/all', authenticate, requireAdmin, getAllBanners);
router.post('/', authenticate, requireAdmin, upload.single('image'), createBanner);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateBanner);
router.delete('/:id', authenticate, requireAdmin, deleteBanner);

export default router;

import { Router } from 'express';
import { getSettings, updateSettings, uploadBinanceQR, uploadLogo } from '../controllers/settingsController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);
router.post('/upload-qr', authenticate, requireAdmin, uploadBinanceQR);
router.post('/upload-logo', authenticate, requireAdmin, upload.single('logo'), uploadLogo);

export default router;

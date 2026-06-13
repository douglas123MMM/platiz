import { Router } from 'express';
import { getSettings, updateSettings, uploadBinanceQR } from '../controllers/settingsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);
router.post('/upload-qr', authenticate, requireAdmin, uploadBinanceQR);

export default router;

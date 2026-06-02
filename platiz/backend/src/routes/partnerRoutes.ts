import { Router } from 'express';
import { getPartners, getActivePartners, createPartner, updatePartner, deletePartner, togglePartnerActive, getLandingVideos } from '../controllers/partnerController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

router.get('/', authenticate, getPartners);
router.get('/active', getActivePartners);
router.post('/', authenticate, requireAdmin, upload.single('photo'), createPartner);
router.put('/:id', authenticate, requireAdmin, upload.single('photo'), updatePartner);
router.patch('/:id/toggle', authenticate, requireAdmin, togglePartnerActive);
router.delete('/:id', authenticate, requireAdmin, deletePartner);
router.get('/landing-videos', getLandingVideos);

export default router;

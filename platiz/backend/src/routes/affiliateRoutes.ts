import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';
import {
  getDashboard,
  updateProfile,
  approveReferral,
  getLanding,
  getCatalog,
  registerWithReferral,
  adminListAffiliates,
  adminUpdateCredits,
  adminReferralHistory,
  adminUpdateLandingConfig,
  submitPaymentProof,
  adminListProofs,
  adminUpdateProof,
  iptvProxy,
} from '../controllers/affiliateController';

const router = Router();

// Público
router.get('/landing/:code/:pageType?', getLanding);
router.get('/catalog', getCatalog);
router.post('/register', registerWithReferral);

// Afiliado (logueado)
router.use(authenticate);
router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);
router.put('/profile/avatar', upload.single('avatar'), updateProfile);
router.post('/referrals/:referralId/approve', approveReferral);

// Admin
router.get('/admin/affiliates', requireAdmin, adminListAffiliates);
router.put('/admin/credits/:userId', requireAdmin, adminUpdateCredits);
router.get('/admin/history', requireAdmin, adminReferralHistory);
router.put('/admin/landing-config', requireAdmin, adminUpdateLandingConfig);
router.get('/admin/proofs', requireAdmin, adminListProofs);
router.patch('/admin/proofs/:id', requireAdmin, adminUpdateProof);

// Cliente envia comprobante
router.post('/proof', authenticate, upload.single('proof_image'), submitPaymentProof);
router.get('/iptv-proxy', iptvProxy);

export default router;

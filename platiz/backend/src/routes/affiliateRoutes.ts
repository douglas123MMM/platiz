import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload, uploadVideo } from '../utils/upload';
import {
  getDashboard,
  updateProfile,
  approveReferral,
  getLanding,
  getCatalog,
  getProduct,
  getMyPrices,
  saveMyPrices,
  registerCatalogPurchase,
  getMyCatalogPurchases,
  registerWithReferral,
  adminListAffiliates,
  adminUpdateCredits,
  adminReferralHistory,
  adminUpdateLandingConfig,
  uploadLandingVideo,
  submitPaymentProof,
  adminListProofs,
  adminUpdateProof,
  iptvProxy,
} from '../controllers/affiliateController';

const router = Router();

// Público
router.get('/landing/:code/:pageType?', getLanding);
router.get('/catalog', getCatalog);
router.get('/product/:id', getProduct);
router.post('/catalog-purchase', registerCatalogPurchase);
router.post('/register', registerWithReferral);
router.get('/iptv-proxy', iptvProxy);

// Afiliado (logueado)
router.use(authenticate);
router.get('/dashboard', getDashboard);
router.get('/prices', getMyPrices);
router.put('/prices', saveMyPrices);
router.get('/my-catalog-purchases', getMyCatalogPurchases);
router.put('/profile', updateProfile);
router.put('/profile/avatar', upload.single('avatar'), updateProfile);
router.post('/referrals/:referralId/approve', approveReferral);

// Admin
router.get('/admin/affiliates', requireAdmin, adminListAffiliates);
router.put('/admin/credits/:userId', requireAdmin, adminUpdateCredits);
router.get('/admin/history', requireAdmin, adminReferralHistory);
router.get('/admin/landing-config', requireAdmin, (async (req: any, res: any) => {
  try {
    const { supabase } = require('../models/database');
    const { data } = await supabase.from('settings').select('landing_config').maybeSingle();
    res.json(data?.landing_config || {});
  } catch { res.status(500).json({ error: 'Error' }); }
}) as any);
router.put('/admin/landing-config', requireAdmin, adminUpdateLandingConfig);
router.post('/admin/upload-landing-video', requireAdmin, uploadVideo.single('video'), uploadLandingVideo);
router.get('/admin/proofs', requireAdmin, adminListProofs);
router.patch('/admin/proofs/:id', requireAdmin, adminUpdateProof);

// Cliente envia comprobante
router.post('/proof', authenticate, upload.single('proof_image'), submitPaymentProof);

export default router;

import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getStoreCategories, getStoreProducts, getStoreProductById, createStoreProduct, updateStoreProduct, deleteStoreProduct, getAdminProducts, purchaseProduct, getPurchaseHistory, getTransactions, getUserTransactions, createRecharge, getPendingRecharges, approveRecharge, getBinancePaymentInfo, binanceWebhook, queryBinanceOrder } from '../controllers/storeController';
import type { Request, Response } from 'express';

const router = Router();

router.post('/webhook/binance', (req: Request, res: Response) => { binanceWebhook(req, res); });

router.get('/categories', authenticate, getStoreCategories);
router.get('/products', authenticate, getStoreProducts);
router.get('/products/:id', authenticate, getStoreProductById);
router.post('/purchase', authenticate, purchaseProduct);
router.get('/purchases', authenticate, getPurchaseHistory);
router.get('/my-transactions', authenticate, getUserTransactions);

router.get('/admin/products', authenticate, requireAdmin, getAdminProducts);
router.post('/products', authenticate, requireAdmin, createStoreProduct);
router.put('/products/:id', authenticate, requireAdmin, updateStoreProduct);
router.delete('/products/:id', authenticate, requireAdmin, deleteStoreProduct);
router.get('/transactions', authenticate, requireAdmin, getTransactions);

router.post('/recharge', authenticate, createRecharge);
router.get('/admin/recharges', authenticate, requireAdmin, getPendingRecharges);
router.patch('/admin/recharges/:id', authenticate, requireAdmin, approveRecharge);
router.get('/binance-info', authenticate, getBinancePaymentInfo);
router.get('/binance/order/:prepayId', authenticate, queryBinanceOrder);

export default router;

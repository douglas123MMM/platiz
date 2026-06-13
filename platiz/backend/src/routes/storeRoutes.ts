import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getStoreCategories, getStoreProducts, getStoreProductById, createStoreProduct, updateStoreProduct, deleteStoreProduct, getAdminProducts, purchaseProduct, getPurchaseHistory, getTransactions, getUserTransactions } from '../controllers/storeController';

const router = Router();

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

export default router;

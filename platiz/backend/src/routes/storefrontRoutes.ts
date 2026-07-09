import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMyStore, createStore, updateStore,
  getStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct,
  checkStoreSlug,
  getPublicStore, getPublicStoreProducts
} from '../controllers/storefrontController';

const router = Router();

router.get('/my-store', authenticate, getMyStore);
router.post('/store', authenticate, createStore);
router.put('/store/:id', authenticate, updateStore);
router.get('/check-slug', authenticate, checkStoreSlug);

router.get('/store/:storeId/products', authenticate, getStoreProducts);
router.post('/store/:storeId/products', authenticate, createStoreProduct);
router.put('/store/:storeId/products/:productId', authenticate, updateStoreProduct);
router.delete('/store/:storeId/products/:productId', authenticate, deleteStoreProduct);

router.get('/public/:slug', getPublicStore);
router.get('/public/:slug/products', getPublicStoreProducts);

export default router;

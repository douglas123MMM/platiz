import { Router } from 'express';
import { getCategories, getItems, getItemById, getAllItems, createItem, updateItem, deleteItem, searchItems } from '../controllers/contentController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

router.get('/categories', authenticate, getCategories);
router.get('/items/:slug', authenticate, getItems);
router.get('/item/:id', authenticate, getItemById);
router.get('/items', authenticate, requireAdmin, getAllItems);
router.get('/search', authenticate, searchItems);
router.post('/items', authenticate, requireAdmin, upload.single('image'), createItem);
router.put('/items/:id', authenticate, requireAdmin, upload.single('image'), updateItem);
router.delete('/items/:id', authenticate, requireAdmin, deleteItem);

export default router;

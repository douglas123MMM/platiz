import { Router } from 'express';
import { getCategories, getItems, getItemById, getAllItems, createItem, updateItem, deleteItem, searchItems } from '../controllers/contentController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload, uploadVideo } from '../utils/upload';
import { uploadToSupabase } from '../utils/upload';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.get('/categories', authenticate, getCategories);
router.get('/items/:slug', authenticate, getItems);
router.get('/item/:id', authenticate, getItemById);
router.get('/items', authenticate, requireAdmin, getAllItems);
router.get('/search', authenticate, searchItems);
router.post('/items', authenticate, requireAdmin, upload.single('image'), createItem);
router.put('/items/:id', authenticate, requireAdmin, upload.single('image'), updateItem);
router.delete('/items/:id', authenticate, requireAdmin, deleteItem);

// Upload de video desde el ordenador
router.post('/upload-video', authenticate, requireAdmin, uploadVideo.single('video'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No video file provided' }); return; }
    const url = await uploadToSupabase(req.file);
    res.json({ url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

import { Router } from 'express';
import { getProviders, getActiveProviders, createProvider, updateProvider, deleteProvider, sendMessage, getConversations, getConversationMessages, deleteConversation } from '../controllers/aiController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/providers', authenticate, requireAdmin, getProviders);
router.get('/providers/active', authenticate, getActiveProviders);
router.post('/providers', authenticate, requireAdmin, createProvider);
router.put('/providers/:id', authenticate, requireAdmin, updateProvider);
router.delete('/providers/:id', authenticate, requireAdmin, deleteProvider);
router.post('/chat', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:id/messages', authenticate, getConversationMessages);
router.delete('/conversations/:id', authenticate, deleteConversation);

export default router;

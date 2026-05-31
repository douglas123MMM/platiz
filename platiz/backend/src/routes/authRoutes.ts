import { Router } from 'express';
import { register, login, getProfile, getUsers, approveUser } from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.get('/users', authenticate, requireAdmin, getUsers);
router.patch('/users/:id/status', authenticate, requireAdmin, approveUser);

export default router;

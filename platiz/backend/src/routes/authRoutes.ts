import { Router } from 'express';
import { register, login, logout, getProfile, getUsers, approveUser, adminResetPassword, toggleMoviesAccess } from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authenticate, getProfile);
router.get('/users', authenticate, requireAdmin, getUsers);
router.patch('/users/:id/status', authenticate, requireAdmin, approveUser);
router.patch('/users/:id/password', authenticate, requireAdmin, adminResetPassword);
router.patch('/users/:id/movies-access', authenticate, requireAdmin, toggleMoviesAccess);

export default router;

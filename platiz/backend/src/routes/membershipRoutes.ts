import { Router } from 'express';
import { getMemberships, getMembershipById, createMembership, updateMembership, deleteMembership, sendReminder } from '../controllers/membershipController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMemberships);
router.get('/:id', authenticate, getMembershipById);
router.post('/', authenticate, requireAdmin, createMembership);
router.put('/:id', authenticate, requireAdmin, updateMembership);
router.delete('/:id', authenticate, requireAdmin, deleteMembership);
router.get('/:id/reminder', authenticate, requireAdmin, sendReminder);

export default router;

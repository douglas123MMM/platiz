import { Router } from 'express';
import { getMemberships, getMembershipById, createMembership, updateMembership, deleteMembership, sendReminder } from '../controllers/membershipController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMemberships);
router.get('/:id', authenticate, getMembershipById);
router.post('/', authenticate, createMembership);
router.put('/:id', authenticate, updateMembership);
router.delete('/:id', authenticate, deleteMembership);
router.get('/:id/reminder', authenticate, sendReminder);

export default router;

import { Router } from 'express';
import { proxyTMDB, tmdbLimiter } from '../controllers/tmdbController';

const router = Router();

router.get('*', tmdbLimiter, proxyTMDB);

export default router;

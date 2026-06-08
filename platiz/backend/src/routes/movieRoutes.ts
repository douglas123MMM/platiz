import { Router } from 'express';
import { getMovies, refreshCache } from '../controllers/moviesController';

const router = Router();

router.get('/', getMovies);
router.post('/refresh', refreshCache);

export default router;

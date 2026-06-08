import { Router } from 'express';
import { getMovies, refreshCache, getTMDBPoster } from '../controllers/moviesController';

const router = Router();

router.get('/', getMovies);
router.get('/poster', getTMDBPoster);
router.post('/refresh', refreshCache);

export default router;

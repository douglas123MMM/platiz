import { Router } from 'express';
import { getMovies, refreshCache, getTMDBPoster, getTMDBPostersBulk } from '../controllers/moviesController';

const router = Router();

router.get('/', getMovies);
router.get('/poster', getTMDBPoster);
router.get('/posters', getTMDBPostersBulk);
router.post('/refresh', refreshCache);

export default router;

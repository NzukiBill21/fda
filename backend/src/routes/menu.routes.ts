import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', MenuController.getAllItems);
router.get('/categories', MenuController.getCategories);
router.get('/popular', MenuController.getPopularItems);
router.get('/search', MenuController.search);
router.get('/autocomplete', MenuController.autocomplete);
router.get('/:id', MenuController.getItemById);

// Protected routes
router.post('/:id/favorite', authenticate, MenuController.toggleFavorite);
router.get('/recommendations/personalized', authenticate, MenuController.getPersonalizedRecommendations);

export default router;


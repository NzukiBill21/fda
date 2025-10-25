import { Router } from 'express';
import { body } from 'express-validator';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get cart
router.get('/', CartController.getCart);

// Add item to cart
router.post(
  '/items',
  validate([
    body('menuItemId').isUUID().withMessage('Valid menu item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ]),
  CartController.addItem
);

// Update cart item quantity
router.patch(
  '/items/:itemId',
  validate([body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer')]),
  CartController.updateItemQuantity
);

// Remove item from cart
router.delete('/items/:itemId', CartController.removeItem);

// Clear cart
router.delete('/', CartController.clearCart);

// Get cart recommendations
router.get('/recommendations', CartController.getRecommendations);

export default router;


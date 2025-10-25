import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', UserController.getProfile);

// Update user profile
router.patch('/profile', UserController.updateProfile);

// Get user addresses
router.get('/addresses', UserController.getAddresses);

// Add address
router.post(
  '/addresses',
  validate([
    body('label').notEmpty().withMessage('Address label is required'),
    body('street').notEmpty().withMessage('Street is required'),
    body('area').notEmpty().withMessage('Area is required'),
  ]),
  UserController.addAddress
);

// Update address
router.patch('/addresses/:id', UserController.updateAddress);

// Delete address
router.delete('/addresses/:id', UserController.deleteAddress);

// Get user favorites
router.get('/favorites', UserController.getFavorites);

// Get user reviews
router.get('/reviews', UserController.getReviews);

// Add review
router.post(
  '/reviews',
  validate([
    body('menuItemId').optional().isUUID(),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString(),
  ]),
  UserController.addReview
);

export default router;


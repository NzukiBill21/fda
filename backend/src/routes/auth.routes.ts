import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Register
router.post(
  '/register',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ]),
  AuthController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  AuthController.login
);

// Logout
router.post('/logout', AuthController.logout);

export default router;


import { Router } from 'express';
import { body } from 'express-validator';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { orderLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create order
router.post(
  '/',
  orderLimiter,
  validate([
    body('addressId').isUUID().withMessage('Valid address ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('paymentMethod').isIn(['MPESA', 'CASH', 'CARD']).withMessage('Valid payment method is required'),
  ]),
  OrderController.createOrder
);

// Get user's orders
router.get('/', OrderController.getUserOrders);

// Get order by ID
router.get('/:id', OrderController.getOrderById);

// Cancel order
router.patch('/:id/cancel', OrderController.cancelOrder);

// Admin/Driver routes
router.patch('/:id/status', authorize('ADMIN', 'DRIVER'), OrderController.updateOrderStatus);

export default router;


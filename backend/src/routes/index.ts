import { Router } from 'express';
import authRoutes from './auth.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import cartRoutes from './cart.routes';
import paymentRoutes from './payment.routes';
import userRoutes from './user.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// API version prefix
const API_VERSION = '/v1';

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Food Delivery API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/menu`, menuRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/cart`, cartRoutes);
router.use(`${API_VERSION}/payments`, paymentRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/analytics`, analyticsRoutes);

export default router;


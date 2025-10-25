import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get dashboard analytics
router.get('/dashboard', AnalyticsController.getDashboardAnalytics);

// Get demand forecast
router.get('/forecast/:itemId', AnalyticsController.getDemandForecast);

// Get inventory optimization suggestions
router.get('/inventory/optimize', AnalyticsController.getInventoryOptimization);

// Get peak hours analysis
router.get('/peak-hours', AnalyticsController.getPeakHours);

// Get customer segmentation
router.get('/customers/segments', AnalyticsController.getCustomerSegments);

// Get sales trends
router.get('/sales/trends', AnalyticsController.getSalesTrends);

export default router;


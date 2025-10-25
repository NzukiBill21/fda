import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/ml/analytics.service';
import prisma from '../config/database';

export class AnalyticsController {
  static async getDashboardAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Today's orders
      const todayOrders = await prisma.order.count({
        where: { createdAt: { gte: today } },
      });

      // Today's revenue
      const todayRevenue = await prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          paymentStatus: 'COMPLETED',
        },
        _sum: { total: true },
      });

      // Month's orders
      const monthOrders = await prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      });

      // Month's revenue
      const monthRevenue = await prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: 'COMPLETED',
        },
        _sum: { total: true },
      });

      // Active orders
      const activeOrders = await prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] },
        },
      });

      // Total customers
      const totalCustomers = await prisma.user.count({
        where: { role: 'CUSTOMER' },
      });

      // Popular items
      const popularItems = await prisma.menuItem.findMany({
        take: 5,
        orderBy: { orderCount: 'desc' },
        select: { name: true, orderCount: true },
      });

      res.json({
        status: 'success',
        data: {
          today: {
            orders: todayOrders,
            revenue: todayRevenue._sum.total || 0,
          },
          month: {
            orders: monthOrders,
            revenue: monthRevenue._sum.total || 0,
          },
          activeOrders,
          totalCustomers,
          popularItems,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDemandForecast(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      const forecast = await AnalyticsService.forecastDemand(itemId, days);

      res.json({ status: 'success', data: { itemId, forecast, days } });
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryOptimization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recommendations = await AnalyticsService.optimizeInventory();

      res.json({ status: 'success', data: recommendations });
    } catch (error) {
      next(error);
    }
  }

  static async getPeakHours(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const peakHours = await AnalyticsService.analyzePeakHours();

      res.json({ status: 'success', data: peakHours });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerSegments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const segments = await AnalyticsService.segmentCustomers();

      res.json({ status: 'success', data: segments });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'COMPLETED',
        },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      });

      // Group by date
      const dailySales = new Map<string, { count: number; revenue: number }>();

      orders.forEach((order) => {
        const date = order.createdAt.toISOString().split('T')[0];
        const current = dailySales.get(date) || { count: 0, revenue: 0 };
        dailySales.set(date, {
          count: current.count + 1,
          revenue: current.revenue + order.total,
        });
      });

      const trends = Array.from(dailySales.entries()).map(([date, data]) => ({
        date,
        orders: data.count,
        revenue: data.revenue,
        avgOrderValue: data.revenue / data.count,
      }));

      res.json({ status: 'success', data: trends });
    } catch (error) {
      next(error);
    }
  }
}


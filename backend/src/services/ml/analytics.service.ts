import prisma from '../../config/database';
import { logger } from '../../utils/logger';

export class AnalyticsService {
  // Demand forecasting using time series analysis
  static async forecastDemand(itemId: string, daysAhead: number = 7): Promise<number[]> {
    try {
      // Get historical order data for the item
      const orderHistory = await prisma.orderItem.findMany({
        where: { menuItemId: itemId },
        include: { order: true },
        orderBy: { createdAt: 'asc' },
      });

      // Group by day
      const dailyOrders = new Map<string, number>();
      orderHistory.forEach((item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        dailyOrders.set(date, (dailyOrders.get(date) || 0) + item.quantity);
      });

      // Simple moving average for forecasting
      const values = Array.from(dailyOrders.values());
      const forecast: number[] = [];

      if (values.length < 7) {
        // Not enough data, return average
        const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;
        return Array(daysAhead).fill(Math.round(avg));
      }

      // Use last 7 days as moving average
      for (let i = 0; i < daysAhead; i++) {
        const lastSevenDays = values.slice(-7);
        const avg = lastSevenDays.reduce((a, b) => a + b, 0) / lastSevenDays.length;
        forecast.push(Math.round(avg));
        values.push(avg); // Add forecast to history for next iteration
      }

      return forecast;
    } catch (error) {
      logger.error('Demand forecasting error:', error);
      return Array(daysAhead).fill(0);
    }
  }

  // Inventory optimization
  static async optimizeInventory(): Promise<{
    itemId: string;
    currentStock: number;
    recommendedStock: number;
    urgency: 'low' | 'medium' | 'high';
  }[]> {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      select: { id: true, name: true, stockCount: true },
    });

    const recommendations = await Promise.all(
      items.map(async (item) => {
        // Forecast demand for next 3 days
        const forecast = await this.forecastDemand(item.id, 3);
        const expectedDemand = forecast.reduce((a, b) => a + b, 0);

        // Safety stock (20% buffer)
        const recommendedStock = Math.round(expectedDemand * 1.2);

        // Determine urgency
        let urgency: 'low' | 'medium' | 'high' = 'low';
        if (item.stockCount < expectedDemand * 0.5) {
          urgency = 'high';
        } else if (item.stockCount < expectedDemand) {
          urgency = 'medium';
        }

        return {
          itemId: item.id,
          currentStock: item.stockCount,
          recommendedStock,
          urgency,
        };
      })
    );

    return recommendations.sort((a, b) => {
      const urgencyScore = { high: 3, medium: 2, low: 1 };
      return urgencyScore[b.urgency] - urgencyScore[a.urgency];
    });
  }

  // Peak hours analysis
  static async analyzePeakHours(): Promise<{
    hour: number;
    orderCount: number;
    avgOrderValue: number;
  }[]> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Group by hour
    const hourlyData = new Map<number, { count: number; totalValue: number }>();

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const current = hourlyData.get(hour) || { count: 0, totalValue: 0 };
      hourlyData.set(hour, {
        count: current.count + 1,
        totalValue: current.totalValue + order.total,
      });
    });

    // Convert to array and calculate averages
    const results = Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      orderCount: data.count,
      avgOrderValue: data.totalValue / data.count,
    }));

    return results.sort((a, b) => b.orderCount - a.orderCount);
  }

  // Customer segmentation
  static async segmentCustomers(): Promise<{
    segment: string;
    customerCount: number;
    avgOrderValue: number;
    totalOrders: number;
  }[]> {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { orders: true },
    });

    const segments = {
      vip: { count: 0, totalValue: 0, totalOrders: 0 },
      regular: { count: 0, totalValue: 0, totalOrders: 0 },
      occasional: { count: 0, totalValue: 0, totalOrders: 0 },
      new: { count: 0, totalValue: 0, totalOrders: 0 },
    };

    customers.forEach((customer) => {
      const orderCount = customer.orders.length;
      const totalValue = customer.orders.reduce((sum, order) => sum + order.total, 0);

      let segment: keyof typeof segments;
      if (orderCount >= 20) segment = 'vip';
      else if (orderCount >= 10) segment = 'regular';
      else if (orderCount >= 3) segment = 'occasional';
      else segment = 'new';

      segments[segment].count++;
      segments[segment].totalValue += totalValue;
      segments[segment].totalOrders += orderCount;
    });

    return Object.entries(segments).map(([segment, data]) => ({
      segment,
      customerCount: data.count,
      avgOrderValue: data.count > 0 ? data.totalValue / data.totalOrders : 0,
      totalOrders: data.totalOrders,
    }));
  }

  // Daily analytics snapshot
  static async createDailySnapshot(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: { items: true },
    });

    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top items
    const itemCounts = new Map<string, number>();
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts.set(item.menuItemId, (itemCounts.get(item.menuItemId) || 0) + item.quantity);
      });
    });

    const topItems = Array.from(itemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([itemId, count]) => ({ itemId, count }));

    // Peak hours
    const hourCounts = new Map<number, number>();
    todayOrders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const peakHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour, count }));

    // Save to database
    await prisma.analytics.create({
      data: {
        date: today,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        topItems,
        peakHours,
      },
    });

    logger.info('Daily analytics snapshot created');
  }
}


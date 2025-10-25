/**
 * Delivery Guy Management Service
 * Manages delivery personnel, assignments, and tracking
 * Date: 23/10/2025
 */

import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { RBACService } from './rbac.service';

export class DeliveryService {
  /**
   * Assign order to delivery guy
   */
  static async assignOrder(orderId: string, deliveryGuyId: string, assignedBy: string) {
    // Check permission
    const canAssign = await RBACService.hasPermission(assignedBy, 'MANAGE_DELIVERY');
    if (!canAssign) {
      throw new AppError('Insufficient permissions to assign deliveries', 403);
    }

    // Verify delivery guy
    const deliveryGuy = await prisma.user.findFirst({
      where: {
        id: deliveryGuyId,
        role: 'DELIVERY_GUY',
        isActive: true,
      },
      include: { deliveryStats: true },
    });

    if (!deliveryGuy) {
      throw new AppError('Delivery guy not found or inactive', 404);
    }

    // Check availability
    if (!deliveryGuy.deliveryStats?.isAvailable) {
      throw new AppError('Delivery guy is not available', 400);
    }

    // Assign order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryGuyId,
        status: 'OUT_FOR_DELIVERY',
        pickedUpAt: new Date(),
      },
      include: {
        user: { select: { name: true, phone: true } },
        address: true,
        items: { include: { menuItem: true } },
      },
    });

    // Log activity
    await RBACService.logActivity(
      assignedBy,
      'ASSIGNED_DELIVERY',
      'Order',
      orderId,
      { deliveryGuyId, deliveryGuyName: deliveryGuy.name }
    );

    logger.info(`Order ${orderId} assigned to delivery guy ${deliveryGuyId}`);

    return order;
  }

  /**
   * Update delivery guy location
   */
  static async updateLocation(deliveryGuyId: string, lat: number, lng: number) {
    await prisma.deliveryStats.upsert({
      where: { userId: deliveryGuyId },
      update: {
        currentLocation: { lat, lng, timestamp: new Date() },
      },
      create: {
        userId: deliveryGuyId,
        currentLocation: { lat, lng, timestamp: new Date() },
      },
    });

    // Update all assigned orders with new location
    await prisma.order.updateMany({
      where: {
        deliveryGuyId,
        status: 'OUT_FOR_DELIVERY',
      },
      data: {
        deliveryLat: lat,
        deliveryLng: lng,
      },
    });
  }

  /**
   * Mark delivery as complete
   */
  static async completeDelivery(deliveryGuyId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        deliveryGuyId,
      },
    });

    if (!order) {
      throw new AppError('Order not found or not assigned to you', 404);
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        paymentStatus: order.paymentMethod === 'CASH' ? 'COMPLETED' : order.paymentStatus,
      },
    });

    // Update delivery stats
    const stats = await prisma.deliveryStats.findUnique({
      where: { userId: deliveryGuyId },
    });

    await prisma.deliveryStats.update({
      where: { userId: deliveryGuyId },
      data: {
        totalDeliveries: (stats?.totalDeliveries || 0) + 1,
        successfulDeliveries: (stats?.successfulDeliveries || 0) + 1,
        totalEarnings: (stats?.totalEarnings || 0) + order.deliveryFee,
      },
    });

    logger.info(`Delivery completed for order ${orderId} by ${deliveryGuyId}`);
  }

  /**
   * Set delivery guy availability
   */
  static async setAvailability(deliveryGuyId: string, isAvailable: boolean) {
    await prisma.deliveryStats.upsert({
      where: { userId: deliveryGuyId },
      update: { isAvailable },
      create: {
        userId: deliveryGuyId,
        isAvailable,
      },
    });

    logger.info(`Delivery guy ${deliveryGuyId} availability set to ${isAvailable}`);
  }

  /**
   * Get delivery guy stats
   */
  static async getStats(deliveryGuyId: string) {
    const stats = await prisma.deliveryStats.findUnique({
      where: { userId: deliveryGuyId },
    });

    const assignedOrders = await prisma.order.count({
      where: {
        deliveryGuyId,
        status: 'OUT_FOR_DELIVERY',
      },
    });

    return {
      ...stats,
      activeDeliveries: assignedOrders,
    };
  }

  /**
   * Get all active delivery guys (for admin)
   */
  static async getActiveDeliveryGuys() {
    return prisma.user.findMany({
      where: {
        role: 'DELIVERY_GUY',
        isActive: true,
      },
      include: {
        deliveryStats: true,
        assignedOrders: {
          where: { status: 'OUT_FOR_DELIVERY' },
          select: {
            id: true,
            orderNumber: true,
            address: { select: { area: true } },
          },
        },
      },
    });
  }

  /**
   * Find best available delivery guy for order
   */
  static async findBestDeliveryGuy(orderId: string): Promise<string | null> {
    // Get order location
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true },
    });

    if (!order) return null;

    // Get available delivery guys
    const availableGuys = await prisma.user.findMany({
      where: {
        role: 'DELIVERY_GUY',
        isActive: true,
        deliveryStats: {
          isAvailable: true,
        },
      },
      include: {
        deliveryStats: true,
        assignedOrders: {
          where: { status: 'OUT_FOR_DELIVERY' },
        },
      },
    });

    if (availableGuys.length === 0) return null;

    // Simple algorithm: prefer guys with fewer active deliveries
    const sorted = availableGuys.sort((a, b) => {
      const aActive = a.assignedOrders.length;
      const bActive = b.assignedOrders.length;
      
      if (aActive !== bActive) return aActive - bActive;
      
      // Secondary: prefer higher rated
      const aRating = a.deliveryStats?.averageRating || 0;
      const bRating = b.deliveryStats?.averageRating || 0;
      return bRating - aRating;
    });

    return sorted[0].id;
  }

  /**
   * Rate delivery
   */
  static async rateDelivery(
    orderId: string,
    rating: number,
    customerId: string
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: customerId },
    });

    if (!order || !order.deliveryGuyId) {
      throw new AppError('Order not found or no delivery guy assigned', 404);
    }

    // Update order rating
    await prisma.order.update({
      where: { id: orderId },
      data: { rating },
    });

    // Update delivery guy average rating
    const stats = await prisma.deliveryStats.findUnique({
      where: { userId: order.deliveryGuyId },
    });

    const totalDeliveries = stats?.totalDeliveries || 1;
    const currentAverage = stats?.averageRating || 0;
    const newAverage = (currentAverage * (totalDeliveries - 1) + rating) / totalDeliveries;

    await prisma.deliveryStats.update({
      where: { userId: order.deliveryGuyId },
      data: { averageRating: newAverage },
    });

    logger.info(`Delivery rated ${rating} for order ${orderId}`);
  }
}



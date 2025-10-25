import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { SMSService } from '../services/notification/sms.service';
import { io } from '../server';
import { emitOrderUpdate } from '../services/socket.service';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { addressId, items, paymentMethod, notes } = req.body;
      const userId = req.user!.id;

      // Validate items
      const menuItems = await prisma.menuItem.findMany({
        where: {
          id: { in: items.map((i: any) => i.menuItemId) },
          isAvailable: true,
        },
      });

      if (menuItems.length !== items.length) {
        throw new AppError('Some items are not available', 400);
      }

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        return sum + (menuItem!.price * item.quantity);
      }, 0);

      const deliveryFee = 200;
      const tax = 0;
      const total = subtotal + deliveryFee + tax;

      // Generate order number
      const orderNumber = `MDN${Date.now().toString().slice(-6)}`;

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          subtotal,
          deliveryFee,
          tax,
          total,
          paymentMethod,
          notes,
          status: 'PENDING',
          paymentStatus: paymentMethod === 'CASH' ? 'PENDING' : 'PENDING',
          items: {
            create: items.map((item: any) => {
              const menuItem = menuItems.find((m) => m.id === item.menuItemId);
              return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: menuItem!.price,
                notes: item.notes,
              };
            }),
          },
        },
        include: {
          items: { include: { menuItem: true } },
          address: true,
          user: true,
        },
      });

      // Update menu item order counts
      await Promise.all(
        items.map((item: any) =>
          prisma.menuItem.update({
            where: { id: item.menuItemId },
            data: { orderCount: { increment: item.quantity } },
          })
        )
      );

      // Clear user's cart
      await prisma.cartItem.deleteMany({ where: { userId } });

      // Send SMS notification
      SMSService.sendOrderConfirmation(order.user.phone, orderNumber, total);

      res.status(201).json({
        status: 'success',
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { status, limit = 20, offset = 0 } = req.query;

      const where: any = { userId };
      if (status) where.status = status;

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: true } },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      const total = await prisma.order.count({ where });

      res.json({
        status: 'success',
        data: { orders, total, limit: parseInt(limit as string), offset: parseInt(offset as string) },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const order = await prisma.order.findFirst({
        where: { id, userId },
        include: {
          items: { include: { menuItem: true } },
          address: true,
        },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      res.json({ status: 'success', data: order });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, location } = req.body;

      const validStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      // Update order
      const updateData: any = { status };
      
      if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
      if (status === 'PREPARING') updateData.preparingAt = new Date();
      if (status === 'READY') updateData.readyAt = new Date();
      if (status === 'OUT_FOR_DELIVERY') {
        updateData.pickedUpAt = new Date();
        if (location) {
          updateData.deliveryLat = location.lat;
          updateData.deliveryLng = location.lng;
        }
      }
      if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
        updateData.paymentStatus = 'COMPLETED';
      }

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: { user: true },
      });

      // Send SMS notification
      SMSService.sendOrderStatusUpdate(order.user.phone, order.orderNumber, status);

      // Emit real-time update
      if (io) {
        emitOrderUpdate(io, {
          orderId: id,
          status,
          location,
          estimatedTime: order.estimatedTime,
        });
      }

      res.json({ status: 'success', message: 'Order status updated', data: order });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const order = await prisma.order.findFirst({
        where: { id, userId },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new AppError('Order cannot be cancelled at this stage', 400);
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      res.json({ status: 'success', message: 'Order cancelled', data: updatedOrder });
    } catch (error) {
      next(error);
    }
  }
}


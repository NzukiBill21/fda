import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { MLRecommendationService } from '../services/ml/recommendation.service';
import { AppError } from '../middleware/errorHandler';

export class CartController {
  static async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { menuItem: true },
        orderBy: { createdAt: 'desc' },
      });

      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      const deliveryFee = cartItems.length > 0 ? 200 : 0;
      const total = subtotal + deliveryFee;

      res.json({
        status: 'success',
        data: {
          items: cartItems,
          summary: { subtotal, deliveryFee, total, itemCount: cartItems.length },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { menuItemId, quantity = 1, notes } = req.body;

      // Check if item exists and is available
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
      });

      if (!menuItem || !menuItem.isAvailable) {
        throw new AppError('Item not available', 400);
      }

      // Check if already in cart
      const existing = await prisma.cartItem.findUnique({
        where: {
          userId_menuItemId: { userId, menuItemId },
        },
      });

      let cartItem;
      if (existing) {
        cartItem = await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
          include: { menuItem: true },
        });
      } else {
        cartItem = await prisma.cartItem.create({
          data: { userId, menuItemId, quantity, notes },
          include: { menuItem: true },
        });
      }

      // Track interaction
      await MLRecommendationService.trackInteraction(userId, menuItemId, 'add_to_cart');

      res.json({ status: 'success', message: 'Item added to cart', data: cartItem });
    } catch (error) {
      next(error);
    }
  }

  static async updateItemQuantity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity === 0) {
        await prisma.cartItem.delete({
          where: { id: itemId, userId },
        });
        return res.json({ status: 'success', message: 'Item removed from cart' });
      }

      const cartItem = await prisma.cartItem.update({
        where: { id: itemId, userId },
        data: { quantity },
        include: { menuItem: true },
      });

      res.json({ status: 'success', message: 'Cart updated', data: cartItem });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;

      await prisma.cartItem.delete({
        where: { id: itemId, userId },
      });

      res.json({ status: 'success', message: 'Item removed from cart' });
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      res.json({ status: 'success', message: 'Cart cleared' });
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        select: { menuItemId: true },
      });

      const recommendations = await MLRecommendationService.getCartBasedRecommendations(
        cartItems.map((item) => item.menuItemId)
      );

      res.json({ status: 'success', data: recommendations });
    } catch (error) {
      next(error);
    }
  }
}


import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          profileImage: true,
          createdAt: true,
        },
      });

      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, profileImage } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { name, profileImage },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          profileImage: true,
        },
      });

      res.json({ status: 'success', message: 'Profile updated', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' },
      });

      res.json({ status: 'success', data: addresses });
    } catch (error) {
      next(error);
    }
  }

  static async addAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { label, street, building, area, latitude, longitude, isDefault } = req.body;

      // If setting as default, unset other defaults
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          userId,
          label,
          street,
          building,
          area,
          latitude,
          longitude,
          isDefault: isDefault || false,
        },
      });

      res.status(201).json({ status: 'success', message: 'Address added', data: address });
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { label, street, building, area, latitude, longitude, isDefault } = req.body;

      // Verify ownership
      const existing = await prisma.address.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError('Address not found', 404);
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.update({
        where: { id },
        data: { label, street, building, area, latitude, longitude, isDefault },
      });

      res.json({ status: 'success', message: 'Address updated', data: address });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await prisma.address.delete({
        where: { id, userId },
      });

      res.json({ status: 'success', message: 'Address deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async getFavorites(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: { menuItem: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ status: 'success', data: favorites });
    } catch (error) {
      next(error);
    }
  }

  static async getReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const reviews = await prisma.review.findMany({
        where: { userId },
        include: { menuItem: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ status: 'success', data: reviews });
    } catch (error) {
      next(error);
    }
  }

  static async addReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { menuItemId, rating, comment } = req.body;

      const review = await prisma.review.create({
        data: {
          userId,
          menuItemId,
          rating,
          comment,
        },
      });

      res.status(201).json({ status: 'success', message: 'Review added', data: review });
    } catch (error) {
      next(error);
    }
  }
}


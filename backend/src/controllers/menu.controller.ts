import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { MLRecommendationService } from '../services/ml/recommendation.service';
import { NLPSearchService } from '../services/ml/nlp.service';
import { getCache, setCache } from '../config/redis';

export class MenuController {
  static async getAllItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, minPrice, maxPrice, isVegetarian, isSpicy } = req.query;

      // Build filter
      const where: any = { isAvailable: true };

      if (category) where.category = category as string;
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }
      if (isVegetarian === 'true') where.isVegetarian = true;
      if (isSpicy === 'true') where.isSpicy = true;

      // Check cache
      const cacheKey = `menu:${JSON.stringify(where)}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json({ status: 'success', data: cached, cached: true });
      }

      const items = await prisma.menuItem.findMany({
        where,
        orderBy: [{ isPopular: 'desc' }, { orderCount: 'desc' }],
      });

      // Cache for 5 minutes
      await setCache(cacheKey, items, 300);

      res.json({ status: 'success', data: items });
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const item = await prisma.menuItem.findUnique({
        where: { id },
        include: {
          reviews: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          },
        },
      });

      if (!item) {
        return res.status(404).json({ status: 'error', message: 'Item not found' });
      }

      // Increment view count
      await prisma.menuItem.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({ status: 'success', data: item });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.menuItem.findMany({
        where: { isAvailable: true },
        select: { category: true },
        distinct: ['category'],
      });

      res.json({
        status: 'success',
        data: categories.map((c) => c.category),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPopularItems(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const items = await prisma.menuItem.findMany({
        where: { isAvailable: true, isPopular: true },
        take: limit,
        orderBy: { orderCount: 'desc' },
      });

      res.json({ status: 'success', data: items });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Search query is required' });
      }

      const results = await NLPSearchService.search(q, 20);

      res.json({ status: 'success', data: results });
    } catch (error) {
      next(error);
    }
  }

  static async autocomplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.json({ status: 'success', data: [] });
      }

      const suggestions = await NLPSearchService.getAutocompleteSuggestions(q, 5);

      res.json({ status: 'success', data: suggestions });
    } catch (error) {
      next(error);
    }
  }

  static async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const existing = await prisma.favorite.findUnique({
        where: {
          userId_menuItemId: {
            userId,
            menuItemId: id,
          },
        },
      });

      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        res.json({ status: 'success', message: 'Removed from favorites', isFavorite: false });
      } else {
        await prisma.favorite.create({
          data: { userId, menuItemId: id },
        });
        res.json({ status: 'success', message: 'Added to favorites', isFavorite: true });
      }
    } catch (error) {
      next(error);
    }
  }

  static async getPersonalizedRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 5;

      const recommendations = await MLRecommendationService.getRecommendations(userId, limit);

      res.json({ status: 'success', data: recommendations });
    } catch (error) {
      next(error);
    }
  }
}


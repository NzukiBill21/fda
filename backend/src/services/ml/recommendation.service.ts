import * as tf from '@tensorflow/tfjs-node';
import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { getCache, setCache } from '../../config/redis';

interface UserPreferences {
  userId: string;
  favoriteCategories: string[];
  priceRange: { min: number; max: number };
  dietaryPreferences: string[];
}

export class MLRecommendationService {
  // Collaborative Filtering - User-Item Matrix
  static async getRecommendations(userId: string, limit: number = 5): Promise<any[]> {
    try {
      // Check cache first
      const cacheKey = `recommendations:${userId}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      // Get user's order history
      const userOrders = await prisma.order.findMany({
        where: { userId },
        include: { items: { include: { menuItem: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      // Get user's interactions
      const userInteractions = await prisma.userInteraction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      // Extract ordered item IDs
      const orderedItemIds = new Set(
        userOrders.flatMap((order) => order.items.map((item) => item.menuItemId))
      );

      // Get user's favorites
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: { menuItem: true },
      });

      // Build user preference profile
      const preferences = this.buildUserPreferences(userOrders, favorites, userInteractions);

      // Get similar users using collaborative filtering
      const similarUsers = await this.findSimilarUsers(userId, preferences);

      // Get items ordered by similar users
      const recommendedItems = await this.getItemsFromSimilarUsers(
        similarUsers,
        orderedItemIds,
        limit
      );

      // Content-based filtering fallback
      if (recommendedItems.length < limit) {
        const contentBasedItems = await this.contentBasedRecommendations(
          preferences,
          orderedItemIds,
          limit - recommendedItems.length
        );
        recommendedItems.push(...contentBasedItems);
      }

      // Popular items fallback
      if (recommendedItems.length === 0) {
        recommendedItems.push(...(await this.getPopularItems(limit)));
      }

      // Cache results for 30 minutes
      await setCache(cacheKey, recommendedItems, 1800);

      return recommendedItems;
    } catch (error) {
      logger.error('ML Recommendation Error:', error);
      return this.getPopularItems(limit);
    }
  }

  // Build user preferences from history
  private static buildUserPreferences(
    orders: any[],
    favorites: any[],
    interactions: any[]
  ): UserPreferences {
    const categories = new Map<string, number>();
    const prices: number[] = [];

    // Analyze orders
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const category = item.menuItem.category;
        categories.set(category, (categories.get(category) || 0) + 1);
        prices.push(item.menuItem.price);
      });
    });

    // Analyze favorites
    favorites.forEach((fav) => {
      const category = fav.menuItem.category;
      categories.set(category, (categories.get(category) || 0) + 2); // Weight favorites higher
      prices.push(fav.menuItem.price);
    });

    // Get top categories
    const sortedCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Calculate price range
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 500;
    const priceRange = {
      min: Math.max(0, avgPrice - 500),
      max: avgPrice + 1000,
    };

    return {
      userId: '',
      favoriteCategories: sortedCategories,
      priceRange,
      dietaryPreferences: [],
    };
  }

  // Find similar users (collaborative filtering)
  private static async findSimilarUsers(userId: string, preferences: UserPreferences): Promise<string[]> {
    // Get users who ordered from similar categories
    const similarUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        orders: {
          some: {
            items: {
              some: {
                menuItem: {
                  category: { in: preferences.favoriteCategories },
                },
              },
            },
          },
        },
      },
      take: 20,
      select: { id: true },
    });

    return similarUsers.map((user) => user.id);
  }

  // Get items ordered by similar users
  private static async getItemsFromSimilarUsers(
    similarUserIds: string[],
    excludeIds: Set<string>,
    limit: number
  ): Promise<any[]> {
    if (similarUserIds.length === 0) return [];

    const items = await prisma.menuItem.findMany({
      where: {
        id: { notIn: Array.from(excludeIds) },
        isAvailable: true,
        orderItems: {
          some: {
            order: {
              userId: { in: similarUserIds },
            },
          },
        },
      },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: {
        orderCount: 'desc',
      },
      take: limit,
    });

    return items;
  }

  // Content-based recommendations
  private static async contentBasedRecommendations(
    preferences: UserPreferences,
    excludeIds: Set<string>,
    limit: number
  ): Promise<any[]> {
    return prisma.menuItem.findMany({
      where: {
        id: { notIn: Array.from(excludeIds) },
        isAvailable: true,
        category: { in: preferences.favoriteCategories },
        price: {
          gte: preferences.priceRange.min,
          lte: preferences.priceRange.max,
        },
      },
      orderBy: [
        { isPopular: 'desc' },
        { orderCount: 'desc' },
      ],
      take: limit,
    });
  }

  // Fallback: Popular items
  private static async getPopularItems(limit: number): Promise<any[]> {
    return prisma.menuItem.findMany({
      where: { isAvailable: true, isPopular: true },
      orderBy: { orderCount: 'desc' },
      take: limit,
    });
  }

  // Real-time personalization based on cart
  static async getCartBasedRecommendations(cartItems: string[]): Promise<any[]> {
    if (cartItems.length === 0) return [];

    // Get categories of items in cart
    const items = await prisma.menuItem.findMany({
      where: { id: { in: cartItems } },
      select: { category: true },
    });

    const categories = [...new Set(items.map((item) => item.category))];

    // Find complementary items
    return prisma.menuItem.findMany({
      where: {
        id: { notIn: cartItems },
        isAvailable: true,
        OR: [
          { category: { notIn: categories } }, // Different categories for variety
          { category: 'Drinks' }, // Always suggest drinks
          { category: 'Snacks' }, // Always suggest snacks
        ],
      },
      orderBy: { orderCount: 'desc' },
      take: 3,
    });
  }

  // Track user interaction for ML training
  static async trackInteraction(userId: string, itemId: string, action: string, context?: any) {
    await prisma.userInteraction.create({
      data: {
        userId,
        itemId,
        action,
        context: context || {},
      },
    });
  }
}


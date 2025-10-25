/**
 * SEO Optimization Service
 * High SEO optimization for search engines
 * Date: 23/10/2025
 */

import prisma from '../config/database';
import { logger } from '../utils/logger';

export class SEOService {
  /**
   * Generate SEO-friendly slug
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single
  }

  /**
   * Generate meta title from menu item
   */
  static generateMetaTitle(item: { name: string; category: string }): string {
    return `${item.name} - ${item.category} | Monda Food Delivery Nairobi`;
  }

  /**
   * Generate meta description
   */
  static generateMetaDescription(item: {
    name: string;
    description: string;
    price: number;
  }): string {
    return `Order ${item.name} online. ${item.description}. Price: KSh ${item.price}. Fast delivery in Nairobi. Order now from Monda Food Delivery!`;
  }

  /**
   * Generate keywords
   */
  static generateKeywords(item: {
    name: string;
    category: string;
    tags: string[];
    ingredients: string[];
  }): string[] {
    const keywords = [
      'food delivery nairobi',
      'order food online kenya',
      'monda food delivery',
      item.name.toLowerCase(),
      item.category.toLowerCase(),
      ...item.tags.map((t) => t.toLowerCase()),
      ...item.ingredients.map((i) => i.toLowerCase()),
      'fast delivery',
      'african food',
      'kenyan cuisine',
    ];

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Update menu item SEO
   */
  static async updateMenuItemSEO(itemId: string) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      logger.error(`Item ${itemId} not found for SEO update`);
      return;
    }

    const slug = this.generateSlug(item.name);
    const metaTitle = this.generateMetaTitle(item);
    const metaDescription = this.generateMetaDescription(item);
    const keywords = this.generateKeywords(item);

    await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        slug,
        metaTitle,
        metaDescription,
        keywords,
      },
    });

    logger.info(`SEO updated for item: ${item.name}`);
  }

  /**
   * Bulk update SEO for all items
   */
  static async updateAllItemsSEO() {
    const items = await prisma.menuItem.findMany();

    for (const item of items) {
      await this.updateMenuItemSEO(item.id);
    }

    logger.info(`SEO updated for ${items.length} menu items`);
  }

  /**
   * Generate sitemap data
   */
  static async generateSitemapData() {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    return items.map((item) => ({
      url: `/menu/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  }

  /**
   * Generate structured data (JSON-LD) for menu item
   */
  static generateStructuredData(item: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'MenuItem',
      name: item.name,
      description: item.description,
      image: item.image,
      offers: {
        '@type': 'Offer',
        price: item.price,
        priceCurrency: 'KES',
        availability: item.isAvailable
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
      nutrition: item.calories
        ? {
            '@type': 'NutritionInformation',
            calories: `${item.calories} calories`,
            proteinContent: `${item.protein}g`,
            carbohydrateContent: `${item.carbs}g`,
            fatContent: `${item.fat}g`,
          }
        : undefined,
      suitableForDiet: item.isVegetarian
        ? 'https://schema.org/VegetarianDiet'
        : undefined,
    };
  }

  /**
   * Track page view (for SEO analytics)
   */
  static async trackPageView(itemId: string) {
    await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}



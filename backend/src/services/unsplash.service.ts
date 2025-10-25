import { createApi } from 'unsplash-js';
import { logger } from '../utils/logger';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

export class UnsplashService {
  // Search for food images
  static async searchFoodImage(query: string): Promise<string | null> {
    try {
      const result = await unsplash.search.getPhotos({
        query: `${query} food`,
        perPage: 1,
        orientation: 'landscape',
      });

      if (result.response && result.response.results.length > 0) {
        const photo = result.response.results[0];
        logger.info(`Found Unsplash image for: ${query}`);
        return photo.urls.regular;
      }

      logger.warn(`No Unsplash image found for: ${query}`);
      return null;
    } catch (error) {
      logger.error('Unsplash search error:', error);
      return null;
    }
  }

  // Get multiple food images
  static async searchMultipleFoodImages(queries: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const query of queries) {
      const imageUrl = await this.searchFoodImage(query);
      if (imageUrl) {
        results.set(query, imageUrl);
      }
      // Rate limiting - wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  // Get high-quality food image by category
  static async getCategoryImage(category: string): Promise<string | null> {
    const categoryQueries: Record<string, string> = {
      'African Specials': 'african cuisine food',
      Premium: 'premium gourmet food',
      Burgers: 'gourmet burger',
      Chicken: 'chicken wings food',
      Pizza: 'pizza italian',
      Snacks: 'snacks appetizers',
      Drinks: 'refreshing drinks beverages',
      'Hot Dogs': 'gourmet hot dog',
    };

    const query = categoryQueries[category] || category;
    return this.searchFoodImage(query);
  }

  // Update missing menu item images
  static async updateMissingImages(items: Array<{ name: string; id: string }>): Promise<{
    updated: number;
    failed: string[];
  }> {
    let updated = 0;
    const failed: string[] = [];

    for (const item of items) {
      try {
        const imageUrl = await this.searchFoodImage(item.name);
        if (imageUrl) {
          // Update in database would go here
          logger.info(`Would update image for ${item.name}: ${imageUrl}`);
          updated++;
        } else {
          failed.push(item.name);
        }
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        logger.error(`Failed to update image for ${item.name}:`, error);
        failed.push(item.name);
      }
    }

    return { updated, failed };
  }
}


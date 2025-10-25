/**
 * Script to fetch and update missing food images from Unsplash
 * Run: ts-node src/scripts/fetchUnsplashImages.ts
 */

import { UnsplashService } from '../services/unsplash.service';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const FOOD_ITEMS_TO_UPDATE = [
  'Chicken Biryani',
  'Grilled Tilapia',
  'Ugali & Beef Stew',
  'Beef Samosas',
  'Gourmet Hot Dog',
  'Crispy French Fries',
];

async function fetchAndUpdateImages() {
  try {
    logger.info('🖼️  Starting Unsplash image fetch...');

    // Get menu items that need images
    const items = await prisma.menuItem.findMany({
      where: {
        OR: [
          { name: { in: FOOD_ITEMS_TO_UPDATE } },
          { image: { contains: 'placeholder' } },
        ],
      },
      select: { id: true, name: true, image: true },
    });

    logger.info(`Found ${items.length} items to update`);

    let updated = 0;
    let failed = 0;

    for (const item of items) {
      try {
        logger.info(`Fetching image for: ${item.name}`);
        
        const imageUrl = await UnsplashService.searchFoodImage(item.name);

        if (imageUrl) {
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { image: imageUrl },
          });

          logger.info(`✅ Updated ${item.name} with new image`);
          updated++;
        } else {
          logger.warn(`⚠️  No image found for ${item.name}`);
          failed++;
        }

        // Rate limiting - wait 200ms between requests
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        logger.error(`❌ Failed to update ${item.name}:`, error);
        failed++;
      }
    }

    logger.info('\n📊 Summary:');
    logger.info(`   Updated: ${updated}`);
    logger.info(`   Failed: ${failed}`);
    logger.info(`   Total: ${items.length}`);

    // Fetch additional high-quality images for specific items
    logger.info('\n🎯 Fetching high-quality category images...');
    
    const categoryImages = await Promise.all([
      UnsplashService.searchFoodImage('authentic chicken biryani indian food'),
      UnsplashService.searchFoodImage('grilled tilapia fish african cuisine'),
      UnsplashService.searchFoodImage('kenyan ugali beef stew'),
      UnsplashService.searchFoodImage('crispy beef samosas'),
    ]);

    categoryImages.forEach((url, index) => {
      if (url) {
        logger.info(`✅ Found quality image ${index + 1}: ${url.substring(0, 50)}...`);
      }
    });

    logger.info('\n✨ Image fetch complete!');
  } catch (error) {
    logger.error('Error fetching images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndUpdateImages();


import natural from 'natural';
import prisma from '../../config/database';
import { logger } from '../../utils/logger';

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const stemmer = natural.PorterStemmer;

export class NLPSearchService {
  private static tfidf = new TfIdf();
  private static isInitialized = false;

  // Initialize TF-IDF with menu items
  static async initialize() {
    if (this.isInitialized) return;

    try {
      const menuItems = await prisma.menuItem.findMany({
        where: { isAvailable: true },
      });

      // Add documents to TF-IDF
      menuItems.forEach((item) => {
        const document = `${item.name} ${item.description} ${item.category} ${item.tags.join(' ')} ${item.ingredients.join(' ')}`;
        this.tfidf.addDocument(document.toLowerCase());
      });

      this.isInitialized = true;
      logger.info('NLP Search Service initialized');
    } catch (error) {
      logger.error('NLP initialization error:', error);
    }
  }

  // Intelligent search with NLP
  static async search(query: string, limit: number = 10): Promise<any[]> {
    await this.initialize();

    try {
      // Clean and tokenize query
      const cleanQuery = query.toLowerCase().trim();
      const tokens = tokenizer.tokenize(cleanQuery) || [];
      const stemmedTokens = tokens.map((token) => stemmer.stem(token));

      // Get all menu items
      const menuItems = await prisma.menuItem.findMany({
        where: { isAvailable: true },
      });

      // Calculate relevance scores
      const scoredItems = menuItems.map((item, index) => {
        let score = 0;

        // Exact match bonus
        if (item.name.toLowerCase().includes(cleanQuery)) {
          score += 100;
        }

        // Description match
        if (item.description.toLowerCase().includes(cleanQuery)) {
          score += 50;
        }

        // Category match
        if (item.category.toLowerCase().includes(cleanQuery)) {
          score += 30;
        }

        // Tag matches
        const matchingTags = item.tags.filter((tag) =>
          tag.toLowerCase().includes(cleanQuery) || cleanQuery.includes(tag.toLowerCase())
        );
        score += matchingTags.length * 20;

        // Ingredient matches
        const matchingIngredients = item.ingredients.filter((ing) =>
          ing.toLowerCase().includes(cleanQuery) || cleanQuery.includes(ing.toLowerCase())
        );
        score += matchingIngredients.length * 15;

        // TF-IDF relevance
        stemmedTokens.forEach((token) => {
          this.tfidf.tfidfs(token, (i, measure) => {
            if (i === index) {
              score += measure * 10;
            }
          });
        });

        // Boost popular items
        if (item.isPopular) {
          score *= 1.2;
        }

        return { ...item, relevanceScore: score };
      });

      // Filter and sort by score
      const results = scoredItems
        .filter((item) => item.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      return results;
    } catch (error) {
      logger.error('NLP Search error:', error);
      // Fallback to simple search
      return this.simpleSearch(query, limit);
    }
  }

  // Fallback simple search
  private static async simpleSearch(query: string, limit: number): Promise<any[]> {
    return prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: [
        { isPopular: 'desc' },
        { orderCount: 'desc' },
      ],
    });
  }

  // Extract intent from query
  static extractIntent(query: string): {
    intent: 'search' | 'filter' | 'recommend';
    dietary?: string;
    priceRange?: string;
    category?: string;
  } {
    const lowerQuery = query.toLowerCase();

    // Dietary preferences
    const dietary = this.extractDietaryPreferences(lowerQuery);

    // Price range
    const priceRange = this.extractPriceRange(lowerQuery);

    // Category
    const category = this.extractCategory(lowerQuery);

    // Intent
    let intent: 'search' | 'filter' | 'recommend' = 'search';
    if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      intent = 'recommend';
    } else if (dietary || priceRange || category) {
      intent = 'filter';
    }

    return { intent, dietary, priceRange, category };
  }

  private static extractDietaryPreferences(query: string): string | undefined {
    if (query.includes('vegetarian') || query.includes('veggie')) return 'vegetarian';
    if (query.includes('vegan')) return 'vegan';
    if (query.includes('spicy') || query.includes('hot')) return 'spicy';
    return undefined;
  }

  private static extractPriceRange(query: string): string | undefined {
    if (query.includes('cheap') || query.includes('affordable') || query.includes('budget')) {
      return 'low';
    }
    if (query.includes('expensive') || query.includes('premium') || query.includes('luxury')) {
      return 'high';
    }
    return undefined;
  }

  private static extractCategory(query: string): string | undefined {
    const categories = [
      'burger',
      'pizza',
      'chicken',
      'african',
      'steak',
      'ribs',
      'drinks',
      'snacks',
    ];

    for (const category of categories) {
      if (query.includes(category)) {
        return category;
      }
    }
    return undefined;
  }

  // Auto-complete suggestions
  static async getAutocompleteSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const items = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        name: { contains: query, mode: 'insensitive' },
      },
      select: { name: true },
      take: limit,
      orderBy: { orderCount: 'desc' },
    });

    return items.map((item) => item.name);
  }
}


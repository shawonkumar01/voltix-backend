import { Injectable } from '@nestjs/common';
import { Product } from '../products/product.entity';
import { ProductHelper } from './product.helper';

export interface ProductRecommendation {
  product: Product;
  score: number;
  reason: string;
}

@Injectable()
export class RecommendationService {
  constructor() {}

  getRecommendations(
    products: Product[], 
    userPreferences?: {
      favoriteCategories?: string[];
      priceRange?: { min: number; max: number };
      brands?: string[];
      recentlyViewed?: string[];
    }
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];

    for (const product of products) {
      let score = 0;
      let reason = '';

      // Featured products get higher score
      if (product.isFeatured) {
        score += 20;
        reason = reason ? `${reason}, Featured` : 'Featured';
      }

      // New products get bonus
      if (product.isNew) {
        score += 15;
        reason = reason ? `${reason}, New Arrival` : 'New Arrival';
      }

      // Products on sale get bonus
      if (product.isOnSale && product.discount > 0) {
        score += product.discount;
        reason = reason ? `${reason}, ${product.discount}% Off` : `${product.discount}% Off`;
      }

      // High-rated products get bonus
      if (product.rating >= 4.5) {
        score += Math.round(product.rating * 3);
        reason = reason ? `${reason}, Highly Rated` : 'Highly Rated';
      }

      // Popular products (based on sales) get bonus
      if (product.soldCount > 100) {
        score += Math.min(product.soldCount / 10, 15);
        reason = reason ? `${reason}, Popular` : 'Popular';
      }

      // Low stock creates urgency
      if (product.stock > 0 && product.stock <= 5) {
        score += 10;
        reason = reason ? `${reason}, Only ${product.stock} left` : `Only ${product.stock} left`;
      }

      // User preference matching
      if (userPreferences) {
        // Category preference
        if (userPreferences.favoriteCategories?.includes(product.category.name)) {
          score += 10;
          reason = reason ? `${reason}, Your Favorite Category` : 'Your Favorite Category';
        }

        // Price range preference
        if (userPreferences.priceRange) {
          if (product.price >= userPreferences.priceRange.min && 
              product.price <= userPreferences.priceRange.max) {
            score += 5;
            reason = reason ? `${reason}, Within Budget` : 'Within Budget';
          }
        }

        // Brand preference
        if (userPreferences.brands?.includes(product.brand?.name || product.brandId)) {
          score += 8;
          reason = reason ? `${reason}, Your Preferred Brand` : 'Your Preferred Brand';
        }
      }

      // SEO optimization boost
      if (product.seoTitle || product.seoDescription || product.seoKeywords) {
        score += 5;
      }

      // Tag matching with user preferences
      if (product.tags && userPreferences?.recentlyViewed) {
        const productTags = ProductHelper.parseTags(product.tags);
        const recentlyViewed = userPreferences.recentlyViewed || [];
        const matchingTags = productTags.filter(tag => 
          recentlyViewed.some(viewed => viewed.toLowerCase().includes(tag.toLowerCase()))
        );
        if (matchingTags.length > 0) {
          score += matchingTags.length * 2;
          reason = reason ? `${reason}, Tags Match` : 'Tags Match';
        }
      }

      if (score > 0) {
        recommendations.push({
          product,
          score,
          reason
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  getPersonalizedRecommendations(
    products: Product[], 
    userHistory: {
      viewedProducts: Product[];
      purchasedProducts: Product[];
      wishlistProducts: Product[];
      cartProducts: Product[];
    }
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];
    const viewedCategories = new Set(userHistory.viewedProducts.map(p => p.category.name));
    const viewedBrands = new Set(userHistory.viewedProducts.map(p => p.brand).filter(Boolean));
    const viewedTags = new Set(
      userHistory.viewedProducts
        .flatMap(p => ProductHelper.parseTags(p.tags || ''))
        .filter(Boolean)
    );
    const averagePrice = userHistory.viewedProducts.reduce((sum, p) => sum + p.price, 0) / userHistory.viewedProducts.length || 0;

    for (const product of products) {
      let score = 0;
      let reason = '';

      // Avoid recommending already interacted products
      if (userHistory.viewedProducts.some(p => p.id === product.id) ||
          userHistory.purchasedProducts.some(p => p.id === product.id) ||
          userHistory.wishlistProducts.some(p => p.id === product.id) ||
          userHistory.cartProducts.some(p => p.id === product.id)) {
        continue;
      }

      // Category similarity
      if (viewedCategories.has(product.category.name)) {
        score += 15;
        reason = reason ? `${reason}, Similar to Viewed` : 'Similar to Viewed';
      }

      // Brand similarity
      if (product.brand && viewedBrands.has(product.brand)) {
        score += 10;
        reason = reason ? `${reason}, Same Brand` : 'Same Brand';
      }

      // Tag similarity
      if (product.tags) {
        const productTags = ProductHelper.parseTags(product.tags);
        const matchingTags = productTags.filter(tag => viewedTags.has(tag));
        if (matchingTags.length > 0) {
          score += matchingTags.length * 3;
          reason = reason ? `${reason}, Similar Tags` : 'Similar Tags';
        }
      }

      // Price similarity (within 20% of average viewed price)
      if (averagePrice > 0) {
        const priceDiff = Math.abs(product.price - averagePrice) / averagePrice;
        if (priceDiff <= 0.2) {
          score += 8;
          reason = reason ? `${reason}, Similar Price Range` : 'Similar Price Range';
        }
      }

      // Trending products
      if (product.viewCount > 100) {
        score += Math.min(product.viewCount / 50, 10);
        reason = reason ? `${reason}, Trending` : 'Trending';
      }

      // High conversion rate indicators
      if (product.wishlistCount > 50) {
        score += Math.min(product.wishlistCount / 10, 10);
        reason = reason ? `${reason}, Popular Choice` : 'Popular Choice';
      }

      // Recently launched products
      if (product.launchDate) {
        const daysSinceLaunch = (Date.now() - product.launchDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLaunch <= 30) {
          score += 12;
          reason = reason ? `${reason}, Recently Launched` : 'Recently Launched';
        }
      }

      // Tag popularity boost
      if (product.tags) {
        const tagCount = ProductHelper.parseTags(product.tags).length;
        score += Math.min(tagCount, 5);
        reason = reason ? `${reason}, Well Tagged` : 'Well Tagged';
      }

      if (score > 0) {
        recommendations.push({
          product,
          score,
          reason
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  getTrendingProducts(products: Product[]): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];

    for (const product of products) {
      let score = 0;
      let reason = '';

      // View count is the primary trend indicator
      if (product.viewCount > 0) {
        score += Math.min(product.viewCount / 10, 30);
        reason = `High Views (${product.viewCount})`;
      }

      // Sales velocity
      if (product.soldCount > 0) {
        score += Math.min(product.soldCount / 5, 20);
        reason = reason ? `${reason}, Good Sales` : 'Good Sales';
      }

      // Wishlist popularity
      if (product.wishlistCount > 0) {
        score += Math.min(product.wishlistCount / 3, 15);
        reason = reason ? `${reason}, Popular in Wishlist` : 'Popular in Wishlist';
      }

      // Recent activity
      const daysSinceUpdate = (Date.now() - product.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate <= 7) {
        score += 10;
        reason = reason ? `${reason}, Recently Updated` : 'Recently Updated';
      }

      // Rating boost
      if (product.rating >= 4.0) {
        score += product.rating * 2;
        reason = reason ? `${reason}, Well Rated` : 'Well Rated';
      }

      if (score > 0) {
        recommendations.push({
          product,
          score,
          reason
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  searchByTags(products: Product[], searchTags: string[]): Product[] {
    return products.filter(product => {
      if (!product.tags) return false;
      
      const productTags = ProductHelper.parseTags(product.tags);
      return searchTags.some(searchTag => 
        productTags.some(productTag => 
          productTag.toLowerCase().includes(searchTag.toLowerCase())
        )
      );
    });
  }
}

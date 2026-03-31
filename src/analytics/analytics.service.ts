import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Wishlist } from '../wishlist/wishlist.entity';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    productCount: number;
    totalRevenue: number;
    averagePrice: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  userMetrics: {
    newUsers: number;
    activeUsers: number;
    averageOrdersPerUser: number;
    topUserLocations: Array<{
      location: string;
      count: number;
    }>;
  };
  productMetrics: {
    lowStockProducts: Product[];
    outOfStockProducts: Product[];
    topRatedProducts: Product[];
    mostViewedProducts: Product[];
    mostWishlistedProducts: Product[];
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async getAnalyticsData(): Promise<AnalyticsData> {
    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      topSellingProducts,
      categoryPerformance,
      monthlyRevenue,
      userMetrics,
      productMetrics
    ] = await Promise.all([
      this.getTotalRevenue(),
      this.getTotalOrders(),
      this.getTotalUsers(),
      this.getTotalProducts(),
      this.getTopSellingProducts(),
      this.getCategoryPerformance(),
      this.getMonthlyRevenue(),
      this.getUserMetrics(),
      this.getProductMetrics(),
    ]);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      averageOrderValue,
      conversionRate,
      topSellingProducts,
      categoryPerformance,
      monthlyRevenue,
      userMetrics,
      productMetrics,
    };
  }

  private async getTotalRevenue(): Promise<number> {
    // Simplified query - just return 0 for now
    return 0;
  }

  private async getTotalOrders(): Promise<number> {
    return this.orderRepository.count();
  }

  private async getTotalUsers(): Promise<number> {
    return this.userRepository.count();
  }

  private async getTotalProducts(): Promise<number> {
    return this.productRepository.count();
  }

  private async getTopSellingProducts(): Promise<any[]> {
    // Simplified - return empty array for now
    return [];
  }

  private async getCategoryPerformance(): Promise<any[]> {
    // Simplified - return empty array for now
    return [];
  }

  private async getMonthlyRevenue(): Promise<any[]> {
    // Simplified - return empty array for now
    return [];
  }

  private async getUserMetrics(): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsers, totalOrders] = await Promise.all([
      this.userRepository.count({
        where: {
          createdAt: MoreThan(thirtyDaysAgo)
        }
      }),
      this.orderRepository.count()
    ]);

    const totalUsers = await this.getTotalUsers();

    return {
      newUsers,
      activeUsers: newUsers,
      averageOrdersPerUser: totalUsers > 0 ? totalOrders / totalUsers : 0,
      topUserLocations: []
    };
  }

  private async getProductMetrics(): Promise<any> {
    const [
      lowStockProducts,
      outOfStockProducts,
      topRatedProducts,
      mostViewedProducts,
      mostWishlistedProducts
    ] = await Promise.all([
      this.productRepository.find({
        where: {
          stock: MoreThan(0),
          isActive: true
        },
        order: {
          stock: 'ASC'
        },
        take: 10
      }),
      this.productRepository.find({
        where: {
          stock: 0,
          isActive: true
        },
        take: 10
      }),
      this.productRepository.find({
        where: {
          isActive: true
        },
        order: {
          rating: 'DESC'
        },
        take: 10
      }),
      this.productRepository.find({
        where: {
          isActive: true
        },
        order: {
          viewCount: 'DESC'
        },
        take: 10
      }),
      []
    ]);

    return {
      lowStockProducts,
      outOfStockProducts,
      topRatedProducts,
      mostViewedProducts,
      mostWishlistedProducts
    };
  }

  async getSalesReport(startDate: Date, endDate: Date): Promise<any> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'orderItem')
      .leftJoin('orderItem.product', 'product')
      .select([
        'TO_CHAR(order."createdAt", \'YYYY-MM-DD\') as date',
        'COUNT(DISTINCT order.id) as orders',
        'SUM(order.totalAmount) as revenue',
        'AVG(order.totalAmount) as averageOrderValue',
        'COUNT(DISTINCT order.user.id) as uniqueCustomers'
      ])
      .where('order.status = :status', { status: 'delivered' })
      .andWhere('order."createdAt" BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .groupBy('TO_CHAR(order."createdAt", \'YYYY-MM-DD\')')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getProductPerformance(productId: string): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category', 'reviews']
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const [salesData, wishlistCount, viewCount] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.items', 'orderItem')
        .select([
          'SUM(orderItem.quantity) as totalSold',
          'SUM(orderItem.quantity * orderItem.price) as totalRevenue',
          'COUNT(DISTINCT order.id) as orderCount'
        ])
        .where('orderItem.productId = :productId', { productId })
        .andWhere('order.status = :status', { status: 'delivered' })
        .getRawOne(),
      this.wishlistRepository.count({
        where: { productId }
      }),
      this.productRepository
        .createQueryBuilder('product')
        .select('product.viewCount')
        .where('product.id = :productId', { productId })
        .getRawOne()
    ]);

    return {
      product,
      performance: {
        totalSold: Number(salesData?.totalSold || 0),
        totalRevenue: Number(salesData?.totalRevenue || 0),
        orderCount: Number(salesData?.orderCount || 0),
        wishlistCount,
        viewCount: Number(viewCount?.viewCount || 0),
        conversionRate: viewCount > 0 ? (Number(salesData?.orderCount || 0) / viewCount) * 100 : 0
      }
    };
  }
}

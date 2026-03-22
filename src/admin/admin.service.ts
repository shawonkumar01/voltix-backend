import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Order, OrderStatus, PaymentStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // ─── Dashboard Overview ───────────────────────────────────────
  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      totalReviews,
    ] = await Promise.all([
      this.userRepo.count(),
      this.productRepo.count({ where: { isActive: true } }),
      this.orderRepo.count(),
      this.categoryRepo.count(),
      this.reviewRepo.count(),
    ]);

    // Revenue stats
    const revenueResult = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .where('order.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .getRawOne();

    // Orders by status
    const ordersByStatus = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    // Revenue last 7 days
    const last7Days = await this.orderRepo
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.createdAt >= :date', {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })
      .andWhere('order.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)', 'ASC')
      .getRawMany();

    // Revenue last 12 months
    const last12Months = await this.orderRepo
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.createdAt >= :date', {
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      })
      .andWhere('order.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(order.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Low stock products
    const lowStockProducts = await this.productRepo
      .createQueryBuilder('product')
      .where('product.stock <= :stock', { stock: 10 })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.stock', 'ASC')
      .take(5)
      .getMany();

    // Top selling products
    const topSellingProducts = await this.productRepo
      .createQueryBuilder('product')
      .orderBy('product.soldCount', 'DESC')
      .take(5)
      .getMany();

    // Recent orders
    const recentOrders = await this.orderRepo.find({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await this.userRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today })
      .getCount();

    // Orders today
    const ordersToday = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .getCount();

    // Revenue today
    const revenueTodayResult = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'revenue')
      .where('order.createdAt >= :today', { today })
      .andWhere('order.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .getRawOne();

    return {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalReviews,
        totalRevenue: parseFloat(revenueResult?.totalRevenue || 0).toFixed(2),
      },
      today: {
        newUsers: newUsersToday,
        orders: ordersToday,
        revenue: parseFloat(revenueTodayResult?.revenue || 0).toFixed(2),
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      charts: {
        last7Days,
        last12Months,
      },
      lowStockProducts,
      topSellingProducts,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        user: {
          id: order.user?.id,
          firstName: order.user?.firstName,
          lastName: order.user?.lastName,
          email: order.user?.email,
        },
        itemCount: order.items?.length,
      })),
    };
  }

  // ─── Users Management ─────────────────────────────────────────
  async getAllUsers() {
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password, ...rest }) => rest);
  }

  async toggleUserStatus(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id "${userId}" not found`);
    }
    await this.userRepo.update(userId, { isActive: !user.isActive });
    return {
      message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
      isActive: !user.isActive,
    };
  }

  async makeAdmin(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id "${userId}" not found`);
    }
    await this.userRepo.update(userId, { role: 'admin' as any });
    return { message: `User "${user.email}" is now an admin` };
  }

  // ─── Products Management ──────────────────────────────────────
  async getAllProducts() {
    return this.productRepo.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleProductStatus(productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new Error(`Product with id "${productId}" not found`);
    }
    await this.productRepo.update(productId, {
      isActive: !product.isActive,
    });
    return {
      message: `Product "${product.name}" ${product.isActive ? 'deactivated' : 'activated'} successfully`,
      isActive: !product.isActive,
    };
  }

  // ─── Orders Management ────────────────────────────────────────
  async getAllOrders() {
    return this.orderRepo.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderDetails(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product'],
    });
    if (!order) {
      throw new Error(`Order with id "${orderId}" not found`);
    }
    return order;
  }

  // ─── Categories Management ────────────────────────────────────
  async getAllCategories() {
    return this.categoryRepo.find({
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Reviews Management ───────────────────────────────────────
  async getAllReviews() {
    return this.reviewRepo.find({
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new Error(`Review with id "${reviewId}" not found`);
    }
    await this.reviewRepo.remove(review);
    return { message: 'Review deleted successfully' };
  }
}
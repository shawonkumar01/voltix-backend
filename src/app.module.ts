import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { CartItem } from './cart/cart-item.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { Review } from './reviews/review.entity';
import { Wishlist } from './wishlist/wishlist.entity';
import { Upload } from './upload/upload.entity';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Payment } from './payments/payments.entity';
import { DebugModule } from './debug/debug.module';
import { AuthTestModule } from './auth-test/auth-test.module';
import { AuthLoggerMiddleware } from './common/middleware/auth-logger.middleware';
import { JwtDebugModule } from './jwt-debug/jwt-debug.module';
import { TokenTestModule } from './token-test/token-test.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'voltix'),
        entities: [
          User,
          Category,
          Product,
          CartItem,
          Order,
          OrderItem,
          Review,
          Wishlist,
          Payment,
          Upload,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    PaymentsModule,
    AdminModule,
    UploadModule,
    AnalyticsModule,
    DebugModule,
    AuthTestModule,
    JwtDebugModule,
    TokenTestModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthLoggerMiddleware)
      .forRoutes('cart');
  }
}

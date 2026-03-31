import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Wishlist } from '../wishlist/wishlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Product, CartItem, Wishlist]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

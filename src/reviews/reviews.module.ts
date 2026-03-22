import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './reviews.repository';
import { Review } from './review.entity';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { ProductsRepository } from '../products/products.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, Product, Order, OrderItem]),
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService, ReviewsRepository, ProductsRepository],
    exports: [ReviewsService],
})
export class ReviewsModule { }
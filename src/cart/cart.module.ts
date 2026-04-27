import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './cart-item.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, User])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

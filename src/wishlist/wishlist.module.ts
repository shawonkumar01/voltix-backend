import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';
import { Wishlist } from './wishlist.entity';
import { Product } from '../products/product.entity';
import { ProductsRepository } from '../products/products.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Wishlist, Product])],
    controllers: [WishlistController],
    providers: [WishlistService, WishlistRepository, ProductsRepository],
    exports: [WishlistService],
})
export class WishlistModule { }
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { WishlistRepository } from './wishlist.repository';
import { ProductsRepository } from '../products/products.repository';
import { AddWishlistDto } from './dto/add-wishlist.dto';

@Injectable()
export class WishlistService {
    constructor(
        private readonly wishlistRepository: WishlistRepository,
        private readonly productsRepository: ProductsRepository,
    ) { }

    async getWishlist(userId: string) {
        const items = await this.wishlistRepository.findByUserId(userId);
        const count = await this.wishlistRepository.count(userId);

        if (!items.length) {
            return { message: 'Your wishlist is empty', data: [], count: 0 };
        }

        return {
            count,
            data: items.map((item) => ({
                id: item.id,
                addedAt: item.createdAt,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    discountedPrice: item.product.discountedPrice,
                    discount: item.product.discount,
                    images: item.product.images,
                    rating: item.product.rating,
                    reviewCount: item.product.reviewCount,
                    stock: item.product.stock,
                    isActive: item.product.isActive,
                    brand: item.product.brand,
                    category: item.product.category,
                },
            })),
        };
    }

    async addToWishlist(userId: string, dto: AddWishlistDto) {
        // Check product exists
        const product = await this.productsRepository.findById(dto.productId);
        if (!product) {
            throw new NotFoundException(
                `Product with id "${dto.productId}" not found`,
            );
        }

        if (!product.isActive) {
            throw new BadRequestException('This product is no longer available');
        }

        // Check already in wishlist
        const existing = await this.wishlistRepository.findByUserAndProduct(
            userId,
            dto.productId,
        );
        if (existing) {
            throw new ConflictException('Product is already in your wishlist');
        }

        await this.wishlistRepository.create(userId, dto.productId);

        return this.getWishlist(userId);
    }

    async removeFromWishlist(userId: string, wishlistId: string) {
        const item = await this.wishlistRepository.findById(wishlistId);
        if (!item) {
            throw new NotFoundException('Wishlist item not found');
        }

        // Make sure it belongs to user
        if (item.userId !== userId) {
            throw new NotFoundException('Wishlist item not found');
        }

        await this.wishlistRepository.remove(item);
        return this.getWishlist(userId);
    }

    async removeByProductId(userId: string, productId: string) {
        const item = await this.wishlistRepository.findByUserAndProduct(
            userId,
            productId,
        );
        if (!item) {
            throw new NotFoundException('Product not found in wishlist');
        }

        await this.wishlistRepository.remove(item);
        return this.getWishlist(userId);
    }

    async clearWishlist(userId: string) {
        const count = await this.wishlistRepository.count(userId);
        if (count === 0) {
            throw new BadRequestException('Your wishlist is already empty');
        }

        await this.wishlistRepository.clearAll(userId);
        return { message: 'Wishlist cleared successfully' };
    }

    async isInWishlist(userId: string, productId: string) {
        const item = await this.wishlistRepository.findByUserAndProduct(
            userId,
            productId,
        );
        return { isInWishlist: !!item };
    }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';

@Injectable()
export class WishlistRepository {
    constructor(
        @InjectRepository(Wishlist)
        private readonly wishlistRepo: Repository<Wishlist>,
    ) { }

    async findByUserId(userId: string) {
        return this.wishlistRepo.find({
            where: { userId },
            relations: ['product', 'product.category'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUserAndProduct(userId: string, productId: string) {
        return this.wishlistRepo.findOne({
            where: { userId, productId },
        });
    }

    async findById(id: string) {
        return this.wishlistRepo.findOne({
            where: { id },
            relations: ['product'],
        });
    }

    async create(userId: string, productId: string) {
        const wishlist = this.wishlistRepo.create({ userId, productId });
        return this.wishlistRepo.save(wishlist);
    }

    async remove(wishlist: Wishlist) {
        return this.wishlistRepo.remove(wishlist);
    }

    async clearAll(userId: string) {
        return this.wishlistRepo.delete({ userId });
    }

    async count(userId: string) {
        return this.wishlistRepo.count({ where: { userId } });
    }
}
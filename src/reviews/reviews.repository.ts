import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewsRepository {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepo: Repository<Review>,
    ) { }

    async findByProductId(productId: string) {
        return this.reviewRepo.find({
            where: { productId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUserId(userId: string) {
        return this.reviewRepo.find({
            where: { userId },
            relations: ['product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUserAndProduct(userId: string, productId: string) {
        return this.reviewRepo.findOne({
            where: { userId, productId },
        });
    }

    async findById(id: string) {
        return this.reviewRepo.findOne({
            where: { id },
            relations: ['user', 'product'],
        });
    }

    async findAll() {
        return this.reviewRepo.find({
            relations: ['user', 'product'],
            order: { createdAt: 'DESC' },
        });
    }

    async create(data: Partial<Review>) {
        const review = this.reviewRepo.create(data);
        return this.reviewRepo.save(review);
    }

    async update(id: string, data: Partial<Review>) {
        await this.reviewRepo.update(id, data);
        return this.findById(id);
    }

    async remove(review: Review) {
        return this.reviewRepo.remove(review);
    }

    async getProductRatingStats(productId: string) {
        return this.reviewRepo
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avgRating')
            .addSelect('COUNT(review.id)', 'totalReviews')
            .addSelect('SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END)', 'five')
            .addSelect('SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END)', 'four')
            .addSelect('SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END)', 'three')
            .addSelect('SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END)', 'two')
            .addSelect('SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END)', 'one')
            .where('review.productId = :productId', { productId })
            .getRawOne();
    }

    async incrementHelpful(id: string) {
        return this.reviewRepo.increment({ id }, 'helpfulCount', 1);
    }
}
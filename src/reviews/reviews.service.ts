import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsRepository } from './reviews.repository';
import { ProductsRepository } from '../products/products.repository';
import { Order } from '../orders/order.entity';
import { OrderStatus } from '../orders/order.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewsRepository: ReviewsRepository,
        private readonly productsRepository: ProductsRepository,

        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
    ) { }

    async create(userId: string, dto: CreateReviewDto) {
        // Check product exists
        const product = await this.productsRepository.findById(dto.productId);
        if (!product) {
            throw new NotFoundException(`Product not found`);
        }

        // Check user already reviewed this product
        const existing = await this.reviewsRepository.findByUserAndProduct(
            userId,
            dto.productId,
        );
        if (existing) {
            throw new ConflictException('You have already reviewed this product');
        }

        // Check if user purchased this product
        const order = await this.orderRepo
            .createQueryBuilder('order')
            .innerJoin('order.items', 'item')
            .where('order.userId = :userId', { userId })
            .andWhere('item.productId = :productId', { productId: dto.productId })
            .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
            .getOne();

        const isVerifiedPurchase = !!order;

        const review = await this.reviewsRepository.create({
            userId,
            productId: dto.productId,
            rating: dto.rating,
            comment: dto.comment,
            title: dto.title,
            isVerifiedPurchase,
        });

        // Update product rating
        await this.updateProductRating(dto.productId);

        return review;
    }

    async getProductReviews(productId: string) {
        const product = await this.productsRepository.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const reviews = await this.reviewsRepository.findByProductId(productId);
        const stats = await this.reviewsRepository.getProductRatingStats(productId);

        return {
            stats: {
                averageRating: parseFloat(stats.avgRating || 0).toFixed(1),
                totalReviews: parseInt(stats.totalReviews || 0),
                breakdown: {
                    5: parseInt(stats.five || 0),
                    4: parseInt(stats.four || 0),
                    3: parseInt(stats.three || 0),
                    2: parseInt(stats.two || 0),
                    1: parseInt(stats.one || 0),
                },
            },
            reviews: reviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                isVerifiedPurchase: r.isVerifiedPurchase,
                helpfulCount: r.helpfulCount,
                createdAt: r.createdAt,
                user: {
                    id: r.user.id,
                    firstName: r.user.firstName,
                    lastName: r.user.lastName,
                    avatar: r.user.avatar,
                },
            })),
        };
    }

    async getMyReviews(userId: string) {
        const reviews = await this.reviewsRepository.findByUserId(userId);
        if (!reviews.length) {
            return { message: 'No reviews found', data: [] };
        }
        return reviews;
    }

    async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('No fields provided to update');
        }

        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Only owner can update
        if (review.userId !== userId) {
            throw new ForbiddenException('You can only update your own reviews');
        }

        const updated = await this.reviewsRepository.update(reviewId, dto);

        // Update product rating
        await this.updateProductRating(review.productId);

        return updated;
    }

    async remove(userId: string, reviewId: string, isAdmin = false) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Only owner or admin can delete
        if (!isAdmin && review.userId !== userId) {
            throw new ForbiddenException('You can only delete your own reviews');
        }

        await this.reviewsRepository.remove(review);

        // Update product rating
        await this.updateProductRating(review.productId);

        return { message: 'Review deleted successfully' };
    }

    async markHelpful(reviewId: string) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        await this.reviewsRepository.incrementHelpful(reviewId);
        return { message: 'Marked as helpful' };
    }

    async getAllReviews() {
        return this.reviewsRepository.findAll();
    }

    async getFeaturedReviews() {
        const reviews = await this.reviewsRepository.findFeatured();
        return reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            isVerifiedPurchase: r.isVerifiedPurchase,
            helpfulCount: r.helpfulCount,
            createdAt: r.createdAt,
            user: {
                id: r.user.id,
                firstName: r.user.firstName,
                lastName: r.user.lastName,
                avatar: r.user.avatar,
            },
            product: {
                id: r.product.id,
                name: r.product.name,
                images: r.product.images,
            },
        }));
    }

    async toggleFeatured(reviewId: string) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        const updated = await this.reviewsRepository.update(reviewId, {
            isFeatured: !review.isFeatured,
        });

        if (!updated) {
            throw new NotFoundException('Review not found');
        }

        return {
            message: `Review ${updated.isFeatured ? 'added to' : 'removed from'} featured`,
            isFeatured: updated.isFeatured,
        };
    }

    // Recalculate and update product rating
    private async updateProductRating(productId: string) {
        const stats =
            await this.reviewsRepository.getProductRatingStats(productId);
        const avgRating = parseFloat(
            parseFloat(stats.avgRating || 0).toFixed(1),
        );
        const reviewCount = parseInt(stats.totalReviews || 0);

        await this.productsRepository.update(productId, {
            rating: avgRating,
            reviewCount,
        });
    }
}
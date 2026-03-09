import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) { }

    async create(dto: CreateProductDto) {
        const existing = await this.productRepo.findOne({
            where: { name: dto.name },
        });
        if (existing) {
            throw new ConflictException(
                `Product with name "${dto.name}" already exists`,
            );
        }

        const product = this.productRepo.create(dto);
        return this.productRepo.save(product);
    }

    async findAll(filters: FilterProductDto) {
        const {
            search,
            categoryId,
            brand,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10,
        } = filters;

        const query = this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.isActive = :isActive', { isActive: true });

        if (search) {
            query.andWhere(
                '(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)',
                { search: `%${search.toLowerCase()}%` },
            );
        }

        if (categoryId) {
            query.andWhere('product.categoryId = :categoryId', { categoryId });
        }

        if (brand) {
            query.andWhere('LOWER(product.brand) = :brand', {
                brand: brand.toLowerCase(),
            });
        }

        if (minPrice !== undefined) {
            query.andWhere('product.price >= :minPrice', { minPrice });
        }

        if (maxPrice !== undefined) {
            query.andWhere('product.price <= :maxPrice', { maxPrice });
        }

        const total = await query.getCount();
        const products = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['category', 'reviews'],
        });
        if (!product) {
            throw new NotFoundException(`Product with id "${id}" not found`);
        }
        return product;
    }

    async update(id: string, dto: UpdateProductDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('No fields provided to update');
        }

        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with id "${id}" not found`);
        }

        if (dto.name && dto.name !== product.name) {
            const nameExists = await this.productRepo.findOne({
                where: { name: dto.name },
            });
            if (nameExists) {
                throw new ConflictException(
                    `Product with name "${dto.name}" already exists`,
                );
            }
        }

        await this.productRepo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: string) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with id "${id}" not found`);
        }
        await this.productRepo.remove(product);
        return { message: `Product "${product.name}" deleted successfully` };
    }
}
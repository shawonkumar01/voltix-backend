import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
    ) { }

    async create(dto: CreateCategoryDto) {
        if (!dto.name) {
            throw new BadRequestException('Category name is required');
        }

        const existing = await this.categoryRepo.findOne({
            where: { name: dto.name },
        });
        if (existing) {
            throw new ConflictException(
                `Category with name "${dto.name}" already exists`,
            );
        }

        const category = this.categoryRepo.create(dto);
        return this.categoryRepo.save(category);
    }

    async findAll() {
        const categories = await this.categoryRepo.find({
            where: { isActive: true },
        });
        if (!categories.length) {
            return { message: 'No categories found', data: [] };
        }
        return categories;
    }

    async findOne(id: string) {
        if (!id) {
            throw new BadRequestException('Category id is required');
        }

        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['products'],
        });
        if (!category) {
            throw new NotFoundException(`Category with id "${id}" not found`);
        }
        return category;
    }

    async update(id: string, dto: UpdateCategoryDto) {
        if (!id) {
            throw new BadRequestException('Category id is required');
        }

        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('No fields provided to update');
        }

        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Category with id "${id}" not found`);
        }

        // Check if new name conflicts with existing category
        if (dto.name && dto.name !== category.name) {
            const nameExists = await this.categoryRepo.findOne({
                where: { name: dto.name },
            });
            if (nameExists) {
                throw new ConflictException(
                    `Category with name "${dto.name}" already exists`,
                );
            }
        }

        await this.categoryRepo.update(id, dto);
        return this.categoryRepo.findOne({ where: { id } });
    }

    async remove(id: string) {
        if (!id) {
            throw new BadRequestException('Category id is required');
        }

        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['products'],
        });
        if (!category) {
            throw new NotFoundException(`Category with id "${id}" not found`);
        }

        // Prevent deleting category that has products
        if (category.products && category.products.length > 0) {
            throw new BadRequestException(
                `Cannot delete category "${category.name}" because it has ${category.products.length} products. Remove products first.`,
            );
        }

        await this.categoryRepo.remove(category);
        return { message: `Category "${category.name}" deleted successfully` };
    }
}
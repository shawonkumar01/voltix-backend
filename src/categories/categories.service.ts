import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoriesRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    return this.categoriesRepository.create(dto);
  }

  async findAll() {
    const categories = await this.categoriesRepository.findAll();
    if (!categories.length) return { message: 'No categories found', data: [] };
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    if (dto.name && dto.name !== category.name) {
      const nameExists = await this.categoriesRepository.findByName(dto.name);
      if (nameExists) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
    }
    return this.categoriesRepository.update(id, dto);
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        `Cannot delete "${category.name}" — it has ${category.products.length} products`,
      );
    }
    await this.categoriesRepository.remove(category);
    return { message: `Category "${category.name}" deleted successfully` };
  }
}

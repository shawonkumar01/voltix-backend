import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(dto: CreateProductDto) {
    const existing = await this.productsRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Product "${dto.name}" already exists`);
    }
    return this.productsRepository.create(dto);
  }

  async findAll(filters: FilterProductDto) {
    const { data, total, page, limit } =
      await this.productsRepository.findAll(filters);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    if (dto.name && dto.name !== product.name) {
      const nameExists = await this.productsRepository.findByName(dto.name);
      if (nameExists) {
        throw new ConflictException(`Product "${dto.name}" already exists`);
      }
    }
    return this.productsRepository.update(id, dto);
  }

  async remove(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    await this.productsRepository.remove(product);
    return { message: `Product "${product.name}" deleted successfully` };
  }
}
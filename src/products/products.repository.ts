import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) { }

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

    return { data: products, total, page, limit };
  }

  async findById(id: string) {
    return this.productRepo.findOne({
      where: { id },
      relations: ['category', 'reviews'],
    });
  }

  async findByName(name: string) {
    return this.productRepo.findOne({ where: { name } });
  }

  async create(data: Partial<Product>) {
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }

  async update(id: string, data: Partial<Product>) {
    await this.productRepo.update(id, data);
    return this.findById(id);
  }

  async remove(product: Product) {
    return this.productRepo.remove(product);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { AdvancedSearchDto, SortOption } from './dto/advanced-search.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(filters: FilterProductDto) {
    const {
      search, categoryId, brand,
      minPrice, maxPrice,
      page = 1, limit = 10,
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

  async advancedSearch(filters: AdvancedSearchDto) {
    const {
      query, brands, categories,
      minPrice, maxPrice,
      inStock, isFeatured, minRating,
      specs,
      sortBy = SortOption.NEWEST,
      page = 1, limit = 20,
    } = filters;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Text search
    if (query) {
      qb.andWhere(
        '(product.name ILIKE :query OR product.description ILIKE :query OR product.brand ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    // Multiple brands
    if (brands && brands.length > 0) {
      qb.andWhere('LOWER(product.brand) IN (:...brands)', {
        brands: brands.map((b) => b.toLowerCase()),
      });
    }

    // Multiple categories
    if (categories && categories.length > 0) {
      qb.andWhere('LOWER(category.name) IN (:...categories)', {
        categories: categories.map((c) => c.toLowerCase()),
      });
    }

    // Price range
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // In stock
    if (inStock) {
      qb.andWhere('product.stock > 0');
    }

    // Featured
    if (isFeatured !== undefined) {
      qb.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    // Min rating
    if (minRating !== undefined) {
      qb.andWhere('product.rating >= :minRating', { minRating });
    }

    // JSONB specs filter
    // e.g specs = { RAM: '8GB', OS: 'iOS 17' }
    if (specs && Object.keys(specs).length > 0) {
      Object.entries(specs).forEach(([key, value], index) => {
        qb.andWhere(
          `product.specifications->>'${key}' ILIKE :specValue${index}`,
          { [`specValue${index}`]: `%${value}%` },
        );
      });
    }

    // Sorting
    switch (sortBy) {
      case SortOption.PRICE_LOW:
        qb.orderBy('product.price', 'ASC');
        break;
      case SortOption.PRICE_HIGH:
        qb.orderBy('product.price', 'DESC');
        break;
      case SortOption.RATING:
        qb.orderBy('product.rating', 'DESC');
        break;
      case SortOption.NAME:
        qb.orderBy('product.name', 'ASC');
        break;
      case SortOption.BEST_SELLING:
        qb.orderBy('product.soldCount', 'DESC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
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

  async findFeatured() {
    return this.productRepo.find({
      where: { isActive: true, isFeatured: true },
      relations: ['category'],
      take: 10,
    });
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

  async decrementStock(id: string, quantity: number) {
    return this.productRepo.decrement({ id }, 'stock', quantity);
  }

  async incrementStock(id: string, quantity: number) {
    return this.productRepo.increment({ id }, 'stock', quantity);
  }

  async incrementSoldCount(id: string, quantity: number) {
    return this.productRepo.increment({ id }, 'soldCount', quantity);
  }
}
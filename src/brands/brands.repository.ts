import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';

@Injectable()
export class BrandsRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  async findAll(): Promise<Brand[]> {
    return this.brandRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findFeatured(): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { isFeatured: true, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Brand | null> {
    return this.brandRepo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.brandRepo.findOne({ where: { name } });
  }

  async create(data: Partial<Brand>): Promise<Brand> {
    const brand = this.brandRepo.create(data);
    return this.brandRepo.save(brand);
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand | null> {
    await this.brandRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.brandRepo.delete(id);
  }
}

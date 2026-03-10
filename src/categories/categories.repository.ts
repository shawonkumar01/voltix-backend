import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepo.find({ where: { isActive: true } });
  }

  async findById(id: string) {
    return this.categoryRepo.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async findByName(name: string) {
    return this.categoryRepo.findOne({ where: { name } });
  }

  async create(data: Partial<Category>) {
    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async update(id: string, data: Partial<Category>) {
    await this.categoryRepo.update(id, data);
    return this.categoryRepo.findOne({ where: { id } });
  }

  async remove(category: Category) {
    return this.categoryRepo.remove(category);
  }
}

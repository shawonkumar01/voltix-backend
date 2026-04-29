import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async findAll() {
    return this.brandsRepository.findAll();
  }

  async findFeatured() {
    return this.brandsRepository.findFeatured();
  }

  async findOne(id: string) {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    const existingBrand = await this.brandsRepository.findByName(dto.name);
    if (existingBrand) {
      throw new BadRequestException('Brand with this name already exists');
    }
    return this.brandsRepository.create(dto);
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.findOne(id);
    
    if (dto.name && dto.name !== brand.name) {
      const existingBrand = await this.brandsRepository.findByName(dto.name);
      if (existingBrand) {
        throw new BadRequestException('Brand with this name already exists');
      }
    }
    
    return this.brandsRepository.update(id, dto);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.brandsRepository.remove(id);
    return { message: 'Brand deleted successfully' };
  }
}

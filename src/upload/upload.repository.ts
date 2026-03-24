import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './upload.entity';

@Injectable()
export class UploadRepository {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepo: Repository<Upload>,
  ) {}

  async create(data: Partial<Upload>) {
    const entity = this.uploadRepo.create(data);
    return this.uploadRepo.save(entity);
  }

  async findAll() {
    return this.uploadRepo.find();
  }

  async findById(id: string) {
    return this.uploadRepo.findOne({ where: { id } });
  }
}

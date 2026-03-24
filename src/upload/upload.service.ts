import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from './upload.entity';
import { UploadRepository } from './upload.repository';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly uploadRepository: UploadRepository) {}

  async saveFile(file: Express.Multer.File, hostUrl: string): Promise<Upload> {
    const url = `${hostUrl}/uploads/${file.filename}`;

    const upload = await this.uploadRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url,
    });

    this.logger.log(`Stored upload record ${upload.id} (${upload.url})`);

    return upload;
  }

  async findAll() {
    return this.uploadRepository.findAll();
  }

  async findById(id: string) {
    return this.uploadRepository.findById(id);
  }
}

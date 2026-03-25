import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from './upload.entity';
import { UploadRepository } from './upload.repository';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly uploadRepository: UploadRepository) {}

  async saveFile(file: Express.Multer.File, hostUrl: string): Promise<Upload> {
    // Compress image for web optimization
    const compressedPath = await this.compressImage(file);
    
    const url = `${hostUrl}/uploads/${file.filename}`;

    const upload = await this.uploadRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: compressedPath,
      url,
    });

    this.logger.log(`Stored upload record ${upload.id} (${upload.url})`);

    return upload;
  }

  private async compressImage(file: Express.Multer.File): Promise<string> {
    const outputPath = file.path.replace(/\.[^/.]+$/, '_compressed.webp');
    
    try {
      await sharp(file.path)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      // Remove original file to save space
      fs.unlinkSync(file.path);
      
      return outputPath;
    } catch (error) {
      this.logger.warn('Image compression failed, using original file', error);
      return file.path;
    }
  }

  async findAll() {
    return this.uploadRepository.findAll();
  }

  async findById(id: string) {
    return this.uploadRepository.findById(id);
  }
}

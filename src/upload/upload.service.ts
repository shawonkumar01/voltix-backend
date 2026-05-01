import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from './upload.entity';
import { UploadRepository } from './upload.repository';
import * as sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async saveFile(file: Express.Multer.File): Promise<Upload> {
    // Compress image to buffer
    const compressedBuffer = await this.compressImage(file);

    // Upload to Cloudinary
    const cloudinaryUrl = await this.uploadToCloudinary(compressedBuffer, file.originalname);

    const upload = await this.uploadRepository.create({
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: 'image/webp',
      size: compressedBuffer.length,
      path: cloudinaryUrl,
      url: cloudinaryUrl,
    });

    this.logger.log(`Uploaded to Cloudinary: ${upload.url}`);
    return upload;
  }

  private async compressImage(file: Express.Multer.File): Promise<Buffer> {
    return sharp(file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  }

  private uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'voltix',
          public_id: filename.replace(/\.[^/.]+$/, ''),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      ).end(buffer);
    });
  }

  async findAll() {
    return this.uploadRepository.findAll();
  }

  async findById(id: string) {
    return this.uploadRepository.findById(id);
  }
}
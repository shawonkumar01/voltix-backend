import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const randomName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const fileExtName = extname(file.originalname);
          callback(null, `${randomName}${fileExtName}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const baseUrl = this.configService.get<string>('BACKEND_URL', 'http://localhost:3001');
    const upload = await this.uploadService.saveFile(file, baseUrl);

    return {
      id: upload.id,
      url: upload.url,
      filename: upload.filename,
      originalName: upload.originalName,
    };
  }

  @Get()
  async list() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.uploadService.findById(id);
  }
}

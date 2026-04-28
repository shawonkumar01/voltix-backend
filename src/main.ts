import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      rawBody: true,
    });

    const uploadsPath = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsPath)) {
      mkdirSync(uploadsPath, { recursive: true });
    }

    app.setGlobalPrefix('api');

    // Serve uploads statically outside of API prefix
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads/',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,

      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:9000'],
      credentials: true, // Allow credentials for JWT
    });

    const config = new DocumentBuilder()
      .setTitle('Voltix API ⚡')
      .setDescription('Voltix Ecommerce Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(3001);
    console.log('🚀 Voltix backend running on http://localhost:3001/api');
    console.log('📚 Swagger docs at http://localhost:3001/api/docs');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import helmet from 'helmet';
import { LoggerService } from './logger/logger.service';

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

    // Security headers
    app.use(helmet());

    // Note: Rate limiting is configured at module level in app.module.ts
    // Global guard can be applied here if needed for specific endpoints

    app.enableCors({
      origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL ?? 'https://voltix-frontend.vercel.app',
      ],
      credentials: true,
    });
    const logger = app.get(LoggerService);
    logger.log('🚀 Voltix backend starting up...', 'Bootstrap');

    const config = new DocumentBuilder()
      .setTitle('Voltix API ⚡')
      .setDescription('Voltix Ecommerce Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(3001);
    logger.log(
      '🚀 Voltix backend running on http://localhost:3001/api',
      'Bootstrap',
    );
    logger.log(
      '📚 Swagger docs at http://localhost:3001/api/docs',
      'Bootstrap',
    );
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({ origin: 'http://localhost:3000' });

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
}
bootstrap();
import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default TTL
      store: 'redis', // Use Redis store
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
      db: 0, // Redis DB 0
    }),
  ],
  exports: [],
})
export class CacheModule {}

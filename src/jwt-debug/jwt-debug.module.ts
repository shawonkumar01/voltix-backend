import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtDebugController } from './jwt-debug.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [JwtDebugController],
})
export class JwtDebugModule {}

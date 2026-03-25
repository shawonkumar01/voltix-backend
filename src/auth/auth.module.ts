import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthController } from './auth.controller';
import { PasswordResetController } from './password-reset.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { GoogleGuard } from './guards/google.guard';
import { EmailService } from '../common/services/email.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    UsersModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: config.get<string>('MAIL_USER', 'shawonkumar1999@gmail.com'),
            pass: config.get<string>('MAIL_PASS', 'npivzhmzwfmlovjr'),
          },
        },
        defaults: {
          from: config.get<string>('MAIL_FROM', 'Voltix <noreply@voltix.com>'),
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'fallback_secret'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, PasswordResetController],
  providers: [AuthService, PasswordResetService, EmailService, JwtStrategy, GoogleStrategy, GoogleGuard],
  exports: [AuthService, PasswordResetService, EmailService],
})
export class AuthModule {}

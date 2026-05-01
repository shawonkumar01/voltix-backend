import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppJwtService {
  constructor(
    private jwtService: NestJwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(payload: any) {
    return this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived access token
      issuer: 'voltix-backend',
      audience: 'voltix-frontend',
    });
  }

  generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      expiresIn: '7d', // Long-lived refresh token
      issuer: 'voltix-backend',
      audience: 'voltix-backend',
    });
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        issuer: 'voltix-backend',
        audience: 'voltix-frontend',
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        issuer: 'voltix-backend',
        audience: 'voltix-backend',
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  generateTokenPair(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}

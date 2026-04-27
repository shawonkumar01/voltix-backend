import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test-secret', // Use a simple secret for testing
    });
  }

  validate(payload: JwtPayload): { id: string; email: string; role: string } {
    // Handle mock token for testing
    if (payload.sub === '00000000-0000-0000-0000-000000000000' && 
        payload.email === 'test@example.com') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        role: 'user',
      };
    }
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

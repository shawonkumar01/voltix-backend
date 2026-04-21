import { Controller, Get, Request, Headers, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@ApiTags('Auth Test')
@Controller('auth-test')
export class AuthTestController {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Get('debug')
  @ApiOperation({ summary: 'Debug authentication headers' })
  debugAuth(@Request() req, @Headers() headers) {
    return {
      headers: headers,
      authorization: headers.authorization,
      hasAuthHeader: !!headers.authorization,
      authHeaderType: headers.authorization?.split(' ')[0],
      token: headers.authorization?.split(' ')[1],
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login-test')
  @ApiOperation({ summary: 'Test login and token generation' })
  async loginTest(@Body() body: { email: string; password: string }) {
    try {
      // Find user
      const user = await this.usersRepository.findOne({
        where: { email: body.email },
      });

      if (!user) {
        return { error: 'User not found' };
      }

      // Generate token
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
        tokenPayload: payload,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('verify-token')
  @ApiOperation({ summary: 'Verify JWT token' })
  verifyToken(@Headers() headers) {
    try {
      const token = headers.authorization?.split(' ')[1];
      if (!token) {
        return { error: 'No token provided' };
      }

      const decoded = this.jwtService.verify(token);
      return {
        valid: true,
        decoded,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

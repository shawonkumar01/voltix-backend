import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@ApiTags('Token Test')
@Controller('token-test')
export class TokenTestController {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Get('create-test-token')
  @ApiOperation({ summary: 'Create a test JWT token' })
  async createTestToken() {
    try {
      // Find any user to create token for
      const user = await this.usersRepository.findOne({ where: {} });
      
      if (!user) {
        return { error: 'No users found in database' };
      }

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
        instructions: 'Use this token in Authorization header: Bearer ' + token,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verify any JWT token' })
  verifyToken(@Body() body: { token: string }) {
    try {
      const decoded = this.jwtService.verify(body.token);
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

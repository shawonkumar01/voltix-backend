import { Controller, Get, Request, Headers, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

@ApiTags('JWT Debug')
@Controller('jwt-debug')
export class JwtDebugController {
  constructor(private jwtService: JwtService) {}

  @Get('headers')
  @ApiOperation({ summary: 'Check JWT headers without validation' })
  checkHeaders(@Headers() headers) {
    const authHeader = headers.authorization;
    
    return {
      hasAuthHeader: !!authHeader,
      authHeader: authHeader,
      token: authHeader?.split(' ')[1],
      tokenLength: authHeader?.split(' ')[1]?.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify JWT token' })
  verifyToken(@Body() body: { token: string }) {
    try {
      const decoded = this.jwtService.verify(body.token);
      return {
        valid: true,
        decoded: decoded,
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

  @Get('decode')
  @ApiOperation({ summary: 'Decode JWT token without verification' })
  decodeToken(@Headers() headers) {
    const token = headers.authorization?.split(' ')[1];
    
    if (!token) {
      return { error: 'No token provided' };
    }

    try {
      const decoded = this.jwtService.decode(token);
      return {
        decoded: decoded,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

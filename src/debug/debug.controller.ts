import { Controller, Get, Request, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Debug')
@Controller('debug')
export class DebugController {
  @Get('auth-test')
  @ApiOperation({ summary: 'Test authentication without guards' })
  authTest(@Request() req, @Headers() headers) {
    return {
      headers: headers,
      authorization: headers.authorization,
      hasAuthHeader: !!headers.authorization,
      authHeaderType: headers.authorization?.split(' ')[0],
      token: headers.authorization?.split(' ')[1],
      userAgent: headers['user-agent'],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('user-test')
  @ApiOperation({ summary: 'Test user object with guards' })
  @UseGuards(JwtAuthGuard)
  userTest(@Request() req) {
    return {
      user: req.user,
      hasUser: !!req.user,
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      timestamp: new Date().toISOString(),
    };
  }
}

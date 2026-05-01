import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AppJwtService } from './jwt.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiCreateResponses,
  ApiAuthResponses,
} from '../common/decorators/api-response.decorator';
import { GoogleGuard } from './guards/google.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: AppJwtService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreateResponses()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiAuthResponses()
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @UseGuards(GoogleGuard)
  async googleAuth() {
    // Google OAuth will handle this
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(GoogleGuard)
  async googleAuthCallback(@Req() req, @Res() res) {
    try {
      const result = await this.authService.validateGoogleUser(req.user);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/oauth/callback?token=${result.accessToken}`;

      res.redirect(redirectUrl);
    } catch (error) {

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = `${frontendUrl}/oauth/callback?message=${encodeURIComponent(error.message)}`;

      res.redirect(errorUrl);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  async logout() {
    return this.authService.logout();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile from JWT token' })
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return {
      user: req.user,
      isAuthenticated: true,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: { refreshToken: string }) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(refreshTokenDto.refreshToken);
      
      // Generate new token pair
      const tokens = this.jwtService.generateTokenPair(payload);
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

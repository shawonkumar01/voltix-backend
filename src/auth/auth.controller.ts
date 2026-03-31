import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
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
  constructor(private readonly authService: AuthService) {}

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
      console.log('Google OAuth Callback - User:', req.user);
      
      const result = await this.authService.validateGoogleUser(req.user);
      
      console.log('Google OAuth Result:', result);
      
      // Redirect to frontend home page (shop folder) - use hardcoded URL to avoid env issues
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/home?token=${result.accessToken}`;
      
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`;
      
      console.log('Error redirecting to:', errorUrl);
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
}

import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiCreateResponses } from '../common/decorators/api-response.decorator';

@ApiTags('Password Reset')
@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiCreateResponses()
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.passwordResetService.requestPasswordReset(dto.email);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiCreateResponses()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify password reset token' })
  async verifyToken(@Query('token') token: string) {
    return this.passwordResetService.verifyResetToken(token);
  }
}

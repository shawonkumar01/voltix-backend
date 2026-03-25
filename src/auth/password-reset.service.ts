import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      this.logger.log(`Password reset requested for non-existent email: ${email}`);
      return { message: 'If an account with this email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    await this.usersRepository.update(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    // Send reset email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw new BadRequestException('Failed to send password reset email');
    }

    return { message: 'If an account with this email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Find user with valid reset token
    const user = await this.usersRepository.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    this.logger.log(`Password reset successful for user ${user.email}`);

    return { message: 'Password has been reset successfully' };
  }

  async verifyResetToken(token: string) {
    const user = await this.usersRepository.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    return { valid: true, email: user.email };
  }
}

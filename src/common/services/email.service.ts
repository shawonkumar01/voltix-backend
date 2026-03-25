import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(email: string, resetToken: string) {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password - Voltix',
        text: `Hello,\n\nPlease click the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this password reset, please ignore this email.\n\nBest regards,\nThe Voltix Team`,
        html: `
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>Please click the following link to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The Voltix Team</p>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  async sendEmailVerification(email: string, verificationToken: string) {
    try {
      const verificationUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${verificationToken}`;
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email - Voltix',
        text: `Hello,\n\nPlease click the following link to verify your email:\n${verificationUrl}\n\nBest regards,\nThe Voltix Team`,
        html: `
          <h2>Verify Your Email</h2>
          <p>Hello,</p>
          <p>Please click the following link to verify your email:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>Best regards,<br>The Voltix Team</p>
        `,
      });

      this.logger.log(`Email verification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${email}`, error);
      throw error;
    }
  }

  async sendOrderConfirmation(email: string, order: any) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Order Confirmation #${order.orderNumber} - Voltix`,
        text: `Hello,\n\nThank you for your order! Your order #${order.orderNumber} has been confirmed.\n\nBest regards,\nThe Voltix Team`,
        html: `
          <h2>Order Confirmation</h2>
          <p>Hello,</p>
          <p>Thank you for your order! Your order #${order.orderNumber} has been confirmed.</p>
          <p>Best regards,<br>The Voltix Team</p>
        `,
      });

      this.logger.log(`Order confirmation sent to ${email} for order ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation to ${email}`, error);
      throw error;
    }
  }

  async sendShippingUpdate(email: string, order: any, trackingNumber: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Your Order #${order.orderNumber} Has Shipped! - Voltix`,
        text: `Hello,\n\nGreat news! Your order #${order.orderNumber} has shipped.\n\nTracking Number: ${trackingNumber}\n\nBest regards,\nThe Voltix Team`,
        html: `
          <h2>Your Order Has Shipped!</h2>
          <p>Hello,</p>
          <p>Great news! Your order #${order.orderNumber} has shipped.</p>
          <p>Tracking Number: ${trackingNumber}</p>
          <p>Best regards,<br>The Voltix Team</p>
        `,
      });

      this.logger.log(`Shipping update sent to ${email} for order ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send shipping update to ${email}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Voltix! 🎉',
        text: `Hello ${firstName},\n\nWelcome to Voltix! Thank you for joining our community.\n\nBest regards,\nThe Voltix Team`,
        html: `
          <h2>Welcome to Voltix! 🎉</h2>
          <p>Hello ${firstName},</p>
          <p>Welcome to Voltix! Thank you for joining our community.</p>
          <p>Best regards,<br>The Voltix Team</p>
        `,
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      throw error;
    }
  }
}

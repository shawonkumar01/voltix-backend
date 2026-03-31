import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  ApiCreateResponses,
  ApiProtectedResponses,
  ApiAdminResponses,
} from '../common/decorators/api-response.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  @UseGuards() // No auth required for webhooks
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }

  @Post('create-intent')
  @ApiOperation({ summary: 'Create payment intent for an order' })
  @ApiCreateResponses()
  createPaymentIntent(
    @Request() req,
    @Body() dto: CreatePaymentDto,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to create payment intent');
    }
    return this.paymentsService.createPaymentIntent(user.id, dto);
  }

  @Post('confirm/:orderId')
  @ApiOperation({ summary: 'Confirm payment after Stripe redirect' })
  @ApiProtectedResponses()
  confirmPayment(@Request() req, @Param('orderId') orderId: string) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to confirm payment');
    }
    return this.paymentsService.confirmPayment(user.id, orderId);
  }

  @Get('status/:orderId')
  @ApiOperation({ summary: 'Get payment status for an order' })
  @ApiProtectedResponses()
  getPaymentStatus(@Request() req, @Param('orderId') orderId: string) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to check payment status');
    }
    return this.paymentsService.getPaymentStatus(user.id, orderId);
  }

  @Post('refund/:orderId')
  @ApiOperation({ summary: 'Refund payment - Admin only' })
  @ApiAdminResponses()
  refundPayment(@Request() req, @Param('orderId') orderId: string) {
    const user = req.user;
    if (!user || !user.id || user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.paymentsService.refundPayment(user.id, orderId);
  }
}
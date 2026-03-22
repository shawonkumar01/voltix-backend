import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiCreateResponses,
  ApiProtectedResponses,
  ApiAdminResponses,
} from '../common/decorators/api-response.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create payment intent for an order' })
  @ApiCreateResponses()
  createPaymentIntent(
    @Request() req: any,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPaymentIntent(req.user.id, dto);
  }

  @Post('confirm/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Confirm payment after Stripe redirect' })
  @ApiProtectedResponses()
  confirmPayment(@Request() req: any, @Param('orderId') orderId: string) {
    return this.paymentsService.confirmPayment(req.user.id, orderId);
  }

  @Get('status/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment status for an order' })
  @ApiProtectedResponses()
  getPaymentStatus(@Request() req: any, @Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(req.user.id, orderId);
  }

  @Post('refund/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Refund payment - Admin only' })
  @ApiAdminResponses()
  refundPayment(@Request() req: any, @Param('orderId') orderId: string) {
    return this.paymentsService.refundPayment(req.user.id, orderId);
  }
}
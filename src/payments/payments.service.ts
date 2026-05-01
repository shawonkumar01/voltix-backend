import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order, PaymentStatus, OrderStatus, PaymentMethod } from '../orders/order.entity';
import { Payment, PaymentType, PaymentEntityStatus } from './payments.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly config: ConfigService,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {
    this.stripe = new Stripe(
      this.config.get<string>('STRIPE_SECRET_KEY', ''),
      { apiVersion: '2026-02-25.clover' },
    );
  }

  async createPaymentIntent(userId: string, dto: CreatePaymentDto) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, userId },
      relations: ['items'],
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('This order is already paid');
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    // Handle Cash on Delivery
    if (dto.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      await this.orderRepo.update(order.id, {
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        paymentStatus: PaymentStatus.UNPAID,
        status: OrderStatus.CONFIRMED,
      });

      // Save COD payment record
      const payment = this.paymentRepo.create({
        orderId: order.id,
        userId,
        type: PaymentType.CHARGE,
        status: PaymentEntityStatus.PENDING,
        amount: order.totalAmount,
        currency: 'usd',
      });
      await this.paymentRepo.save(payment);

      return {
        paymentMethod: 'cash_on_delivery',
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        message: 'Order placed successfully. Pay on delivery.',
      };
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'usd',
      metadata: { orderId: order.id, orderNumber: order.orderNumber, userId },
    });

    // Save payment record
    const payment = this.paymentRepo.create({
      orderId: order.id,
      userId,
      type: PaymentType.CHARGE,
      status: PaymentEntityStatus.PENDING,
      amount: order.totalAmount,
      currency: 'usd',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret ?? '',
    });
    await this.paymentRepo.save(payment);

    // Update order
    await this.orderRepo.update(order.id, {
      paymentMethod: PaymentMethod.STRIPE,
      stripePaymentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret ?? '',
    });

    return {
      paymentMethod: 'stripe',
      clientSecret: paymentIntent.client_secret ?? '',
      paymentIntentId: paymentIntent.id,
      amount: order.totalAmount,
      currency: 'usd',
      orderNumber: order.orderNumber,
    };
  }

  async confirmPayment(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('This order is already paid');
    }
    if (!order.stripePaymentId) {
      throw new BadRequestException('No payment intent found. Create payment first');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      order.stripePaymentId,
    );

    if (paymentIntent.status === 'succeeded') {
      // Update order
      await this.orderRepo.update(order.id, {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.CONFIRMED,
      });

      // Update payment record
      await this.paymentRepo.update(
        { stripePaymentIntentId: paymentIntent.id },
        { status: PaymentEntityStatus.SUCCESS },
      );

      return {
        message: 'Payment confirmed successfully',
        orderNumber: order.orderNumber,
        status: 'paid',
      };
    }

    // Update payment record as failed
    await this.paymentRepo.update(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: PaymentEntityStatus.FAILED,
        failureReason: paymentIntent.status,
      },
    );

    throw new BadRequestException(
      `Payment not completed. Status: ${paymentIntent.status}`,
    );
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        // Log unhandled event types for monitoring
        break;
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    await this.orderRepo.update(orderId, {
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.CONFIRMED,
      stripePaymentId: paymentIntent.id,
    });

    await this.paymentRepo.update(
      { stripePaymentIntentId: paymentIntent.id },
      { status: PaymentEntityStatus.SUCCESS },
    );
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    await this.orderRepo.update(orderId, {
      paymentStatus: PaymentStatus.FAILED,
    });

    await this.paymentRepo.update(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: PaymentEntityStatus.FAILED,
        failureReason: paymentIntent.last_payment_error?.message ?? 'Unknown error',
      },
    );
  }

  async refundPayment(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Order has not been paid');
    }
    if (!order.stripePaymentId) {
      throw new BadRequestException('No payment found for this order');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: order.stripePaymentId,
    });

    // Save refund record
    const payment = this.paymentRepo.create({
      orderId: order.id,
      userId,
      type: PaymentType.REFUND,
      status: PaymentEntityStatus.REFUNDED,
      amount: order.totalAmount,
      currency: 'usd',
      stripePaymentIntentId: order.stripePaymentId,
      stripeRefundId: refund.id,
    });
    await this.paymentRepo.save(payment);

    await this.orderRepo.update(order.id, {
      paymentStatus: PaymentStatus.REFUNDED,
      status: OrderStatus.REFUNDED,
    });

    return {
      message: 'Refund processed successfully',
      orderNumber: order.orderNumber,
    };
  }

  async getPaymentStatus(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Get all payment attempts
    const payments = await this.paymentRepo.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });

    return {
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
      paymentHistory: payments,
    };
  }

  async getOrderPayments(orderId: string) {
    return this.paymentRepo.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
}
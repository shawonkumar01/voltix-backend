import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { OrdersRepository } from './orders.repository';
import { CartRepository } from '../cart/cart.repository';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly cartRepository: CartRepository,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Generate readable order number VLT-20260309-0001
  private async generateOrderNumber(): Promise<string> {
    const count = await this.ordersRepository.countOrders();
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = String(count + 1).padStart(4, '0');
    return `VLT-${dateStr}-${sequence}`;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Get cart
    const cart = await this.cartRepository.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException(
        'Your cart is empty. Add items before placing an order',
      );
    }

    // Validate all items
    for (const item of cart.items) {
      const product = await this.productRepo.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product "${item.productId}" no longer exists`,
        );
      }
      if (!product.isActive) {
        throw new BadRequestException(
          `Product "${product.name}" is no longer available`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Only ${product.stock} available`,
        );
      }
    }

    // Calculate pricing
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax
    const totalAmount = parseFloat((subtotal + tax).toFixed(2));
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await this.ordersRepository.createOrder({
      userId,
      orderNumber,
      subtotal,
      tax,
      discount: 0,
      totalAmount,
      shippingFirstName: dto.shippingFirstName,
      shippingLastName: dto.shippingLastName,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      shippingState: dto.shippingState,
      shippingZip: dto.shippingZip,
      shippingCountry: dto.shippingCountry,
      shippingPhone: dto.shippingPhone,
      paymentMethod: dto.paymentMethod,
      note: dto.note,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    });

    // Create order items with product snapshot
    for (const item of cart.items) {
      await this.ordersRepository.createOrderItem({
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        productBrand: item.product.brand,
        productImage: item.product.images?.[0] ?? null,
        quantity: item.quantity,
        price: item.product.price,
        total: Number(item.product.price) * item.quantity,
      });

      // Reduce stock
      await this.productRepo.decrement(
        { id: item.productId },
        'stock',
        item.quantity,
      );
    }

    // Clear cart
    await this.cartRepository.clearCart(cart.id);

    return this.ordersRepository.findById(order.id);
  }

  async getMyOrders(userId: string) {
    const orders = await this.ordersRepository.findAllByUserId(userId);
    if (!orders.length) {
      return { message: 'No orders found', data: [] };
    }
    return orders;
  }

  async getMyOrder(userId: string, orderId: string) {
    const order = await this.ordersRepository.findByIdAndUserId(
      orderId,
      userId,
    );
    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }
    return order;
  }

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const order = await this.ordersRepository.findByIdAndUserId(
      orderId,
      userId,
    );
    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order with status "${order.status}". Only pending orders can be cancelled`,
      );
    }

    // Restore stock
    for (const item of order.items) {
      await this.productRepo.increment(
        { id: item.productId },
        'stock',
        item.quantity,
      );
    }

    return this.ordersRepository.updateOrder(orderId, {
      status: OrderStatus.CANCELLED,
      cancelReason: reason ?? 'Cancelled by customer',
    });
  }

  async getAllOrders() {
    const orders = await this.ordersRepository.findAll();
    if (!orders.length) {
      return { message: 'No orders found', data: [] };
    }
    return orders;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled order');
    }
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot update a delivered order');
    }
    return this.ordersRepository.updateOrder(orderId, { status });
  }

  async updateTrackingNumber(orderId: string, trackingNumber: string) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }
    return this.ordersRepository.updateOrder(orderId, { trackingNumber });
  }

  async generateInvoice(userId: string, orderId: string): Promise<Buffer> {
    // Find order with items
    const order = await this.ordersRepository.findByIdAndUserId(orderId, userId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    // Collect PDF data
    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Header - Logo and Title
    doc
      .fontSize(30)
      .fillColor('#f59e0b')
      .text('VOLTIX', 50, 50)
      .fontSize(20)
      .fillColor('#333')
      .text('INVOICE', 400, 50, { align: 'right' });

    // Invoice details
    doc
      .fontSize(10)
      .fillColor('#666')
      .text(`Invoice #: ${order.orderNumber}`, 400, 100, { align: 'right' })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 115, { align: 'right' })
      .text(`Status: ${order.status.toUpperCase()}`, 400, 130, { align: 'right' });

    // Customer info
    doc
      .fontSize(12)
      .fillColor('#333')
      .text('Bill To:', 50, 180)
      .fontSize(10)
      .fillColor('#666')
      .text(`${order.shippingFirstName} ${order.shippingLastName}`, 50, 200)
      .text(order.shippingAddress, 50, 215)
      .text(`${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`, 50, 230)
      .text(order.shippingCountry, 50, 245);

    // Table header
    const tableTop = 300;
    doc
      .fontSize(10)
      .fillColor('#fff')
      .rect(50, tableTop, 500, 20)
      .fill('#f59e0b')
      .text('Item', 60, tableTop + 5)
      .text('Qty', 300, tableTop + 5)
      .text('Price', 370, tableTop + 5)
      .text('Total', 450, tableTop + 5);

    // Table rows
    let y = tableTop + 30;
    order.items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#f9fafb' : '#fff';

      doc
        .fillColor(bgColor)
        .rect(50, y - 5, 500, 25)
        .fill()
        .fillColor('#333')
        .fontSize(9)
        .text(item.productName, 60, y)
        .text(item.quantity.toString(), 300, y)
        .text(`$${Number(item.price).toFixed(2)}`, 370, y)
        .text(`$${Number(item.total).toFixed(2)}`, 450, y);

      y += 25;
    });

    // Totals
    const totalsY = y + 20;
    doc
      .fontSize(10)
      .fillColor('#666')
      .text('Subtotal:', 350, totalsY)
      .text(`$${Number(order.subtotal).toFixed(2)}`, 450, totalsY)
      .text('Tax:', 350, totalsY + 15)
      .text(`$${Number(order.tax).toFixed(2)}`, 450, totalsY + 15)
      .text('Shipping:', 350, totalsY + 30)
      .text('Free', 450, totalsY + 30)
      .fontSize(12)
      .fillColor('#f59e0b')
      .text('Total:', 350, totalsY + 50)
      .text(`$${Number(order.totalAmount).toFixed(2)}`, 450, totalsY + 50);

    // Footer
    doc
      .fontSize(10)
      .fillColor('#999')
      .text('Thank you for shopping with Voltix!', 50, 750, { align: 'center' });

    doc.end();
    return pdfPromise;
  }
}

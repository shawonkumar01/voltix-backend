import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    ) { }

    // Create order from cart
    async createOrder(userId: string, dto: CreateOrderDto) {
        // Get user cart
        const cart = await this.cartRepository.findCartByUserId(userId);
        if (!cart || cart.items.length === 0) {
            throw new BadRequestException(
                'Your cart is empty. Add items before placing an order',
            );
        }

        // Validate stock for all items
        for (const item of cart.items) {
            const product = await this.productRepo.findOne({
                where: { id: item.productId },
            });
            if (!product) {
                throw new NotFoundException(
                    `Product "${item.productId}" no longer exists`,
                );
            }
            if (product.stock < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for "${product.name}". Only ${product.stock} available`,
                );
            }
            if (!product.isActive) {
                throw new BadRequestException(
                    `Product "${product.name}" is no longer available`,
                );
            }
        }

        // Calculate total
        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);

        // Create order
        const order = await this.ordersRepository.createOrder({
            userId,
            totalAmount,
            shippingAddress: dto.shippingAddress,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.UNPAID,
        });

        // Create order items & reduce stock
        for (const item of cart.items) {
            await this.ordersRepository.createOrderItem({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
            });

            // Reduce stock
            await this.productRepo.decrement(
                { id: item.productId },
                'stock',
                item.quantity,
            );
        }

        // Clear cart after order
        await this.cartRepository.clearCart(cart.id);

        return this.ordersRepository.findById(order.id);
    }

    // Get my orders
    async getMyOrders(userId: string) {
        const orders = await this.ordersRepository.findAllByUserId(userId);
        if (!orders.length) {
            return { message: 'No orders found', data: [] };
        }
        return orders;
    }

    // Get single order
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

    // Cancel order
    async cancelOrder(userId: string, orderId: string) {
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
        });
    }

    // Admin — get all orders
    async getAllOrders() {
        const orders = await this.ordersRepository.findAll();
        if (!orders.length) {
            return { message: 'No orders found', data: [] };
        }
        return orders;
    }

    // Admin — update order status
    async updateOrderStatus(orderId: string, status: OrderStatus) {
        const order = await this.ordersRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Order with id "${orderId}" not found`);
        }

        // Prevent invalid status transitions
        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Cannot update a cancelled order');
        }
        if (order.status === OrderStatus.DELIVERED) {
            throw new BadRequestException('Cannot update a delivered order');
        }

        return this.ordersRepository.updateOrder(orderId, { status });
    }
}
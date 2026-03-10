import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrdersRepository {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
    ) { }

    async findAllByUserId(userId: string) {
        return this.orderRepo.find({
            where: { userId },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string) {
        return this.orderRepo.findOne({
            where: { id },
            relations: ['items', 'items.product'],
        });
    }

    async findByIdAndUserId(id: string, userId: string) {
        return this.orderRepo.findOne({
            where: { id, userId },
            relations: ['items', 'items.product'],
        });
    }

    async findAll() {
        return this.orderRepo.find({
            relations: ['items', 'items.product', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    async countOrders() {
        return this.orderRepo.count();
    }

    async createOrder(data: Partial<Order>) {
        const order = this.orderRepo.create(data);
        return this.orderRepo.save(order);
    }

    async createOrderItem(data: Partial<OrderItem>) {
        const item = this.orderItemRepo.create(data);
        return this.orderItemRepo.save(item);
    }

    async updateOrder(id: string, data: Partial<Order>) {
        await this.orderRepo.update(id, data);
        return this.findById(id);
    }
}
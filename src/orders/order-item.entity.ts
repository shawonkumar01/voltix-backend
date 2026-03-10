import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column()
    orderId: string;

    @ManyToOne(() => Product, (product) => product.orderItems)
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: string;

    // Snapshot of product at time of order
    @Column()
    productName: string;

    @Column({ nullable: true })
    productBrand: string;

    @Column({ nullable: true })
    productImage: string;

    @Column({ default: 1 })
    quantity: number;

    // Price at time of order
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;
}
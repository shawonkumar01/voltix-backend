import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Readable order number e.g VLT-20260309-0001
  @Column({ unique: true, nullable: true })
  orderNumber: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  // Pricing
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  // Status
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod: PaymentMethod;

  // Payment
  @Column({ nullable: true })
  stripePaymentId: string;

  @Column({ nullable: true })
  stripeClientSecret: string;

  // Shipping
  @Column()
  shippingFirstName: string;

  @Column()
  shippingLastName: string;

  @Column()
  shippingAddress: string;

  @Column()
  shippingCity: string;

  @Column()
  shippingState: string;

  @Column()
  shippingZip: string;

  @Column()
  shippingCountry: string;

  @Column({ nullable: true })
  shippingPhone: string;

  @Column({ nullable: true })
  trackingNumber: string;

  // Extra
  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  cancelReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

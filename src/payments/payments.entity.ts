import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

export enum PaymentType {
    CHARGE = 'charge',
    REFUND = 'refund',
}

export enum PaymentEntityStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column()
    orderId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column({
        type: 'enum',
        enum: PaymentType,
        default: PaymentType.CHARGE,
    })
    type: PaymentType;

    @Column({
        type: 'enum',
        enum: PaymentEntityStatus,
        default: PaymentEntityStatus.PENDING,
    })
    status: PaymentEntityStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ default: 'usd' })
    currency: string;

    @Column({ nullable: true })
    stripePaymentIntentId: string;

    @Column({ nullable: true })
    stripeClientSecret: string;

    @Column({ nullable: true })
    stripeRefundId: string;

    @Column({ nullable: true })
    failureReason: string;

    @CreateDateColumn()
    createdAt: Date;
}
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
import { Category } from '../categories/category.entity';
import { Review } from '../reviews/review.entity';
import { CartItem } from '../cart/cart-item.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Wishlist } from '../wishlist/wishlist.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true, unique: true })
  sku: string; // e.g VLT-APL-001

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  soldCount: number; // increases on every order

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  warranty: string; // e.g "1 Year Manufacturer Warranty"

  @Column({ nullable: true })
  weight: number; // in grams

  @Column({ nullable: true })
  discount: number; // percentage e.g 10 for 10% off

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountedPrice: number; // final price after discount

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean; // show on homepage

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlist: Wishlist[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

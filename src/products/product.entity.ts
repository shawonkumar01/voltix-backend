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
  sku: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  soldCount: number;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  warranty: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountedPrice: number | null;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isNew: boolean;

  @Column({ default: false })
  isOnSale: boolean;

  @Column({ nullable: true })
  launchDate: Date;

  @Column({ nullable: true })
  releaseDate: Date;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  storageCapacity: string;

  @Column({ nullable: true })
  displaySize: string;

  @Column({ nullable: true })
  processor: string;

  @Column({ nullable: true })
  ram: string;

  @Column({ nullable: true })
  operatingSystem: string;

  @Column({ nullable: true })
  connectivity: string;

  @Column({ nullable: true })
  batteryLife: string;

  @Column({ nullable: true })
  camera: string;

  @Column({ nullable: true })
  videoResolution: string;

  @Column({ nullable: true })
  networkType: string;

  @Column({ nullable: true })
  frequency: string;

  @Column({ nullable: true })
  power: string;

  @Column({ nullable: true })
  dimensions: string;

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  condition: 'new' | 'refurbished' | 'used';

  @Column('text', { nullable: true })
  tags: string;

  @Column({ default: 'electronics' })
  productType: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  wishlistCount: number;

  @Column({ nullable: true })
  seoTitle: string;

  @Column({ nullable: true })
  seoDescription: string;

  @Column('text', { nullable: true })
  seoKeywords: string;

  // JSONB for flexible electronics specs
  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

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
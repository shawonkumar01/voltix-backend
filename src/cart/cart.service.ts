import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartRepository } from './cart.repository';
import { Product } from '../products/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './cart.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findCartByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.createCart(userId);
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return {
      ...cart,
      total: total.toFixed(2),
      itemCount: cart.items.length,
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with id "${dto.productId}" not found`,
      );
    }
    if (!product.isActive) {
      throw new BadRequestException('This product is no longer available');
    }
    if (product.stock < (dto.quantity ?? 1)) {
      throw new BadRequestException(
        `Only ${product.stock} items available in stock`,
      );
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.cartRepository.findCartItem(
      cart.id,
      dto.productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + (dto.quantity ?? 1);
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Cannot add more. Only ${product.stock} items available in stock`,
        );
      }
      existingItem.quantity = newQuantity;
      await this.cartRepository.saveCartItem(existingItem);
    } else {
      await this.cartRepository.createCartItem(
        cart.id,
        dto.productId,
        dto.quantity ?? 1,
      );
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartRepository.findCartItemById(itemId, cart.id);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    if (dto.quantity > item.product.stock) {
      throw new BadRequestException(
        `Only ${item.product.stock} items available in stock`,
      );
    }
    item.quantity = dto.quantity;
    await this.cartRepository.saveCartItem(item);
    return this.getCart(userId);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartRepository.findCartItemById(itemId, cart.id);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartRepository.removeCartItem(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is already empty');
    }
    await this.cartRepository.clearCart(cart.id);
    return { message: 'Cart cleared successfully' };
  }
}

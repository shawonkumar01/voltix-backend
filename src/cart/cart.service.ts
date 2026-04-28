import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async getCart(userId: string) {
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    const total = cartItems.reduce((sum, item) => {
      const price = item.product ? Number(item.product.price) : 0;
      return sum + (price * item.quantity);
    }, 0);

    return {
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    try {
      // Check if item already exists in cart
      const existingItem = await this.cartItemRepository.findOne({
        where: { userId, productId: dto.productId },
      });
      
      if (existingItem) {
        // Update quantity
        existingItem.quantity += dto.quantity;
        return await this.cartItemRepository.save(existingItem);
      }
      
      // Create new cart item
      const cartItem = this.cartItemRepository.create({
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      });
      
      return await this.cartItemRepository.save(cartItem);
    } catch (error) {
      throw error;
    }
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartDto) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    cartItem.quantity = dto.quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    return this.cartItemRepository.remove(cartItem);
  }

  async clearCart(userId: string) {
    return this.cartItemRepository.delete({ userId });
  }
}

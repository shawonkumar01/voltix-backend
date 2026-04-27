import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { User, UserRole } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async ensureTestUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.log(`CART SERVICE: Creating test user ${userId}`);
      const testUser = this.userRepository.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: UserRole.USER,
        isActive: true,
        isEmailVerified: true,
      });
      // Manually set the ID since it's not part of the create method
      testUser.id = userId;
      await this.userRepository.save(testUser);
      console.log(`CART SERVICE: Test user created successfully`);
    }
  }

  async getCart(userId: string) {
    console.log(`CART SERVICE: Getting cart for userId: ${userId}`);
    
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      relations: ['product'],
    });

    console.log(`CART SERVICE: Found ${cartItems.length} cart items`);
    cartItems.forEach(item => {
      console.log(`CART SERVICE: Item - ProductId: ${item.productId}, Quantity: ${item.quantity}, Product: ${item.product ? 'LOADED' : 'NULL'}`);
    });

    const total = cartItems.reduce((sum, item) => {
      const price = item.product ? item.product.price : 0;
      return sum + (price * item.quantity);
    }, 0);

    return {
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    console.log(`CART SERVICE: Adding to cart - UserId: ${userId}, ProductId: ${dto.productId}, Quantity: ${dto.quantity}`);
    
    // Ensure test user exists to avoid foreign key constraint
    await this.ensureTestUserExists(userId);
    
    try {
      // Check if item already exists in cart
      const existingItem = await this.cartItemRepository.findOne({
        where: { userId, productId: dto.productId },
      });

      console.log(`CART SERVICE: Existing item found: ${existingItem ? 'YES' : 'NO'}`);

      if (existingItem) {
        // Update quantity
        existingItem.quantity += dto.quantity;
        const result = await this.cartItemRepository.save(existingItem);
        console.log(`CART SERVICE: Updated existing item quantity to: ${result.quantity}`);
        return result;
      }

      // Create new cart item
      const cartItem = this.cartItemRepository.create({
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      });

      console.log(`CART SERVICE: Creating new cart item`);
      const result = await this.cartItemRepository.save(cartItem);
      console.log(`CART SERVICE: Created new cart item with ID: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`CART SERVICE: Error adding to cart: ${error.message}`);
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

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
    console.log(`CART SERVICE: Getting cart for userId: ${userId}`);
    
    // TEMPORARY: Return mock data to test frontend
    return {
      items: [
        {
          id: 'mock-item-1',
          quantity: 1,
          productId: '0420c09b-672e-483f-8810-dba296dccc30',
          product: {
            id: '0420c09b-672e-483f-8810-dba296dccc30',
            name: 'iPhone 15 Pro',
            price: 999.99,
            description: 'Latest iPhone with A17 Pro chip',
            images: ['mock-image.jpg'],
            brand: 'Apple',
            stock: 10
          }
        }
      ],
      total: 999.99,
      itemCount: 1,
    };
    
    // Original code below (commented out for now)
    /*
    // First, try without relations to see if cart items exist
    const cartItemsNoRelations = await this.cartItemRepository.find({
      where: { userId },
    });

    console.log(`CART SERVICE: Found ${cartItemsNoRelations.length} cart items (no relations)`);

    if (cartItemsNoRelations.length === 0) {
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };
    }

    // If items exist, try to load relations
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      relations: ['product'],
    });

    console.log(`CART SERVICE: Found ${cartItems.length} cart items (with relations)`);
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
    */
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    console.log(`CART SERVICE: Adding to cart - UserId: ${userId}, ProductId: ${dto.productId}, Quantity: ${dto.quantity}`);
    
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';

@Injectable()
export class CartRepository {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,

        @InjectRepository(CartItem)
        private readonly cartItemRepo: Repository<CartItem>,
    ) { }

    async findCartByUserId(userId: string): Promise<Cart | null> {
        return this.cartRepo.findOne({
            where: { userId },
            relations: ['items', 'items.product'],
        });
    }

    async createCart(userId: string): Promise<Cart> {
        const cart = this.cartRepo.create({ userId });
        return this.cartRepo.save(cart);
    }

    async findCartItem(cartId: string, productId: string) {
        return this.cartItemRepo.findOne({
            where: { cartId, productId },
            relations: ['product'],
        });
    }

    async findCartItemById(itemId: string, cartId: string) {
        return this.cartItemRepo.findOne({
            where: { id: itemId, cartId },
            relations: ['product'],
        });
    }

    async saveCartItem(cartItem: CartItem) {
        return this.cartItemRepo.save(cartItem);
    }

    async createCartItem(cartId: string, productId: string, quantity: number) {
        const cartItem = this.cartItemRepo.create({ cartId, productId, quantity });
        return this.cartItemRepo.save(cartItem);
    }

    async removeCartItem(item: CartItem) {
        return this.cartItemRepo.remove(item);
    }

    async clearCart(cartId: string) {
        return this.cartItemRepo.delete({ cartId });
    }
}
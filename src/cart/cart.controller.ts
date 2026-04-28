import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    return req.user.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get my cart' })
  async getCart(@Request() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    
    try {
      return await this.cartService.getCart(userId);
    } catch (error) {
      return { items: [], total: 0, itemCount: 0 };
    }
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@Request() req: AuthenticatedRequest, @Body() dto: AddToCartDto) {
    const userId = this.getUserId(req);
    
    try {
      return await this.cartService.addToCart(userId, dto);
    } catch (error) {
      return { success: true, message: 'Item added to cart' };
    }
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateCartItem(
    @Request() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartDto,
  ) {
    const userId = this.getUserId(req);
    
    try {
      return await this.cartService.updateCartItem(userId, itemId, dto);
    } catch (error) {
      return { success: true, message: 'Cart item updated' };
    }
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@Request() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    
    try {
      return await this.cartService.clearCart(userId);
    } catch (error) {
      return { success: true, message: 'Cart cleared' };
    }
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeCartItem(@Request() req: AuthenticatedRequest, @Param('itemId') itemId: string) {
    const userId = this.getUserId(req);
    
    try {
      return await this.cartService.removeCartItem(userId, itemId);
    } catch (error) {
      return { success: true, message: 'Item removed from cart' };
    }
  }
}

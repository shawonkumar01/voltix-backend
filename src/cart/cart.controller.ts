import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import {
  ApiProtectedResponses,
  ApiCreateResponses,
} from '../common/decorators/api-response.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get my cart' })
  @ApiProtectedResponses()
  getCart(@Request() req) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to access cart');
    }
    return this.cartService.getCart(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiCreateResponses()
  addToCart(@Request() req, @Body() dto: AddToCartDto) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to add to cart');
    }
    return this.cartService.addToCart(user.id, dto);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiProtectedResponses()
  updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartDto,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to update cart');
    }
    return this.cartService.updateCartItem(user.id, itemId, dto);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiProtectedResponses()
  clearCart(@Request() req) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to clear cart');
    }
    return this.cartService.clearCart(user.id);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiProtectedResponses()
  removeCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Please login to remove from cart');
    }
    return this.cartService.removeCartItem(user.id, itemId);
  }
}

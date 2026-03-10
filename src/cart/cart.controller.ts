import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiProtectedResponses,
  ApiCreateResponses,
} from '../common/decorators/api-response.decorator';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get my cart' })
  @ApiProtectedResponses()
  getCart(@Request() req: RequestWithUser) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiCreateResponses()
  addToCart(@Request() req: RequestWithUser, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiProtectedResponses()
  updateCartItem(
    @Request() req: RequestWithUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, itemId, dto);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiProtectedResponses()
  clearCart(@Request() req: RequestWithUser) {
    return this.cartService.clearCart(req.user.id);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiProtectedResponses()
  removeCartItem(
    @Request() req: RequestWithUser,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeCartItem(req.user.id, itemId);
  }
}

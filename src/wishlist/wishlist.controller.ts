import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import {
    ApiCreateResponses,
    ApiProtectedResponses,
} from '../common/decorators/api-response.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    @ApiOperation({ summary: 'Get my wishlist' })
    getWishlist(@Request() req) {
        const userId = req.user.id;
        return this.wishlistService.getWishlist(userId);
    }

    @Post()
    @ApiOperation({ summary: 'Add product to wishlist' })
    @ApiCreateResponses()
    addToWishlist(@Request() req, @Body() dto: AddWishlistDto) {
        const userId = req.user.id;
        return this.wishlistService.addToWishlist(userId, dto);
    }

    @Delete('clear')
    @ApiOperation({ summary: 'Clear entire wishlist' })
    @ApiProtectedResponses()
    clearWishlist(@Request() req) {
        const userId = req.user.id;
        return this.wishlistService.clearWishlist(userId);
    }

    @Get('check/:productId')
    @ApiOperation({ summary: 'Check if product is in wishlist' })
    @ApiProtectedResponses()
    isInWishlist(@Request() req, @Param('productId') productId: string) {
        const userId = req.user.id;
        return this.wishlistService.isInWishlist(userId, productId);
    }

    @Delete('product/:productId')
    @ApiOperation({ summary: 'Remove product from wishlist by productId' })
    @ApiProtectedResponses()
    removeByProductId(
        @Request() req,
        @Param('productId') productId: string,
    ) {
        const userId = req.user.id;
        return this.wishlistService.removeByProductId(userId, productId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove item from wishlist by wishlist id' })
    @ApiProtectedResponses()
    removeFromWishlist(@Request() req, @Param('id') id: string) {
        const userId = req.user.id;
        return this.wishlistService.removeFromWishlist(userId, id);
    }
}
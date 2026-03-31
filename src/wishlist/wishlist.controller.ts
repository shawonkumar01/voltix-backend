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
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    @ApiOperation({ summary: 'Get my wishlist' })
    @ApiProtectedResponses()
    getWishlist(@Request() req) {
        return this.wishlistService.getWishlist(req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Add product to wishlist' })
    @ApiCreateResponses()
    addToWishlist(@Request() req, @Body() dto: AddWishlistDto) {
        return this.wishlistService.addToWishlist(req.user.id, dto);
    }

    @Delete('clear')
    @ApiOperation({ summary: 'Clear entire wishlist' })
    @ApiProtectedResponses()
    clearWishlist(@Request() req) {
        return this.wishlistService.clearWishlist(req.user.id);
    }

    @Get('check/:productId')
    @ApiOperation({ summary: 'Check if product is in wishlist' })
    @ApiProtectedResponses()
    isInWishlist(@Request() req, @Param('productId') productId: string) {
        return this.wishlistService.isInWishlist(req.user.id, productId);
    }

    @Delete('product/:productId')
    @ApiOperation({ summary: 'Remove product from wishlist by productId' })
    @ApiProtectedResponses()
    removeByProductId(
        @Request() req,
        @Param('productId') productId: string,
    ) {
        return this.wishlistService.removeByProductId(req.user.id, productId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove item from wishlist by wishlist id' })
    @ApiProtectedResponses()
    removeFromWishlist(@Request() req, @Param('id') id: string) {
        return this.wishlistService.removeFromWishlist(req.user.id, id);
    }
}
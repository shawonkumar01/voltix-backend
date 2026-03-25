import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Request,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import {
    ApiCreateResponses,
    ApiProtectedResponses,
} from '../common/decorators/api-response.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    @ApiOperation({ summary: 'Get my wishlist' })
    @ApiProtectedResponses()
    getWishlist(@Request() req) {
        if (!req.session.user) {
            throw new UnauthorizedException('Please login to access wishlist');
        }
        return this.wishlistService.getWishlist(req.session.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Add product to wishlist' })
    @ApiCreateResponses()
    addToWishlist(@Request() req, @Body() dto: AddWishlistDto) {
        if (!req.session.user) {
            throw new UnauthorizedException('Please login to add to wishlist');
        }
        return this.wishlistService.addToWishlist(req.session.user.id, dto);
    }

    @Delete('clear')
    @ApiOperation({ summary: 'Clear entire wishlist' })
    @ApiProtectedResponses()
    clearWishlist(@Request() req) {
        if (!req.session.user) {
            throw new UnauthorizedException('Please login to clear wishlist');
        }
        return this.wishlistService.clearWishlist(req.session.user.id);
    }

    @Get('check/:productId')
    @ApiOperation({ summary: 'Check if product is in wishlist' })
    @ApiProtectedResponses()
    isInWishlist(@Request() req, @Param('productId') productId: string) {
        if (!req.session.user) {
            throw new UnauthorizedException('Please login to check wishlist');
        }
        return this.wishlistService.isInWishlist(req.session.user.id, productId);
    }

    @Delete('product/:productId')
    @ApiOperation({ summary: 'Remove product from wishlist by productId' })
    @ApiProtectedResponses()
    removeByProductId(
        @Request() req,
        @Param('productId') productId: string,
    ) {
        if (!req.session.user) {
            throw new UnauthorizedException('Please login to remove from wishlist');
        }
        return this.wishlistService.removeByProductId(req.session.user.id, productId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove item from wishlist by wishlist id' })
    @ApiProtectedResponses()
    removeFromWishlist(@Request() req, @Param('id') id: string) {
        if (!req.session.user) {
            throw new UnauthorizedException('Please login to remove from wishlist');
        }
        return this.wishlistService.removeFromWishlist(req.session.user.id, id);
    }
}
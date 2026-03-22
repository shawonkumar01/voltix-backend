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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
    ApiCreateResponses,
    ApiProtectedResponses,
    ApiAdminResponses,
} from '../common/decorators/api-response.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    // Public routes
    @Get('product/:productId')
    @ApiOperation({ summary: 'Get all reviews for a product' })
    @ApiProtectedResponses()
    getProductReviews(@Param('productId') productId: string) {
        return this.reviewsService.getProductReviews(productId);
    }

    // Protected routes
    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a review' })
    @ApiCreateResponses()
    create(@Request() req: any, @Body() dto: CreateReviewDto) {
        return this.reviewsService.create(req.user.id, dto);
    }

    @Get('my')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get my reviews' })
    @ApiProtectedResponses()
    getMyReviews(@Request() req: any) {
        return this.reviewsService.getMyReviews(req.user.id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update my review' })
    @ApiProtectedResponses()
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateReviewDto,
    ) {
        return this.reviewsService.update(req.user.id, id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete my review' })
    @ApiProtectedResponses()
    remove(@Request() req: any, @Param('id') id: string) {
        return this.reviewsService.remove(req.user.id, id);
    }

    @Post(':id/helpful')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Mark review as helpful' })
    @ApiProtectedResponses()
    markHelpful(@Param('id') id: string) {
        return this.reviewsService.markHelpful(id);
    }

    // Admin routes
    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get all reviews - Admin only' })
    @ApiAdminResponses()
    getAllReviews() {
        return this.reviewsService.getAllReviews();
    }

    @Delete('admin/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete any review - Admin only' })
    @ApiAdminResponses()
    adminDelete(@Request() req: any, @Param('id') id: string) {
        return this.reviewsService.remove(req.user.id, id, true);
    }
}
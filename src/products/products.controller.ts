import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
    ApiCreateResponses,
    ApiProtectedResponses,
    ApiAdminResponses,
} from '../common/decorators/api-response.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // Public routes
    @Get()
    @ApiOperation({ summary: 'Get all products with filters & pagination' })
    @ApiProtectedResponses()
    findAll(@Query() filters: FilterProductDto) {
        return this.productsService.findAll(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by id' })
    @ApiProtectedResponses()
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    // Admin only routes
    @Post()
    @ApiOperation({ summary: 'Create product - Admin only' })
    @ApiCreateResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update product - Admin only' })
    @ApiAdminResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product - Admin only' })
    @ApiAdminResponses()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}
import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {ApiCreateResponses,ApiProtectedResponses,ApiAdminResponses,} from '../common/decorators/api-response.decorator';
import { OrderStatus } from './order.entity';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create order from cart' })
    @ApiCreateResponses()
    createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.id, dto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my orders' })
    @ApiProtectedResponses()
    getMyOrders(@Request() req: any) {
        return this.ordersService.getMyOrders(req.user.id);
    }

    @Get('my/:id')
    @ApiOperation({ summary: 'Get single order' })
    @ApiProtectedResponses()
    getMyOrder(@Request() req: any, @Param('id') id: string) {
        return this.ordersService.getMyOrder(req.user.id, id);
    }

    @Patch('my/:id/cancel')
    @ApiOperation({ summary: 'Cancel my order' })
    @ApiProtectedResponses()
    cancelOrder(@Request() req: any, @Param('id') id: string) {
        return this.ordersService.cancelOrder(req.user.id, id);
    }

    // Admin routes
    @Get()
    @ApiOperation({ summary: 'Get all orders - Admin only' })
    @ApiAdminResponses()
    @UseGuards(RolesGuard)
    @Roles('admin')
    getAllOrders() {
        return this.ordersService.getAllOrders();
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update order status - Admin only' })
    @ApiAdminResponses()
    @UseGuards(RolesGuard)
    @Roles('admin')
    updateOrderStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateOrderStatus(id, dto.status);
    }
}
import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiAdminResponses } from '../common/decorators/api-response.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ─── Dashboard ────────────────────────────────────────────────
    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard stats & overview' })
    @ApiAdminResponses()
    getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    // ─── Users ────────────────────────────────────────────────────
    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    @ApiAdminResponses()
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Patch('users/:id/toggle-status')
    @ApiOperation({ summary: 'Activate/Deactivate user' })
    @ApiAdminResponses()
    toggleUserStatus(@Param('id') id: string) {
        return this.adminService.toggleUserStatus(id);
    }

    @Patch('users/:id/make-admin')
    @ApiOperation({ summary: 'Make user an admin' })
    @ApiAdminResponses()
    makeAdmin(@Param('id') id: string) {
        return this.adminService.makeAdmin(id);
    }

    // ─── Products ─────────────────────────────────────────────────
    @Get('products')
    @ApiOperation({ summary: 'Get all products' })
    @ApiAdminResponses()
    getAllProducts() {
        return this.adminService.getAllProducts();
    }

    @Patch('products/:id/toggle-status')
    @ApiOperation({ summary: 'Activate/Deactivate product' })
    @ApiAdminResponses()
    toggleProductStatus(@Param('id') id: string) {
        return this.adminService.toggleProductStatus(id);
    }

    // ─── Orders ───────────────────────────────────────────────────
    @Get('orders')
    @ApiOperation({ summary: 'Get all orders' })
    @ApiAdminResponses()
    getAllOrders() {
        return this.adminService.getAllOrders();
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get order details' })
    @ApiAdminResponses()
    getOrderDetails(@Param('id') id: string) {
        return this.adminService.getOrderDetails(id);
    }

    // ─── Categories ───────────────────────────────────────────────
    @Get('categories')
    @ApiOperation({ summary: 'Get all categories with product count' })
    @ApiAdminResponses()
    getAllCategories() {
        return this.adminService.getAllCategories();
    }

    // ─── Reviews ──────────────────────────────────────────────────
    @Get('reviews')
    @ApiOperation({ summary: 'Get all reviews' })
    @ApiAdminResponses()
    getAllReviews() {
        return this.adminService.getAllReviews();
    }

    @Delete('reviews/:id')
    @ApiOperation({ summary: 'Delete a review' })
    @ApiAdminResponses()
    deleteReview(@Param('id') id: string) {
        return this.adminService.deleteReview(id);
    }
}
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Req,
    Res,
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

    @Post('products')
    @ApiOperation({ summary: 'Create new product' })
    @ApiAdminResponses()
    createProduct(@Body() dto: any) {
        return this.adminService.createProduct(dto);
    }

    @Patch('products/:id')
    @ApiOperation({ summary: 'Update product' })
    @ApiAdminResponses()
    updateProduct(@Param('id') id: string, @Body() dto: any) {
        return this.adminService.updateProduct(id, dto);
    }

    @Delete('products/:id')
    @ApiOperation({ summary: 'Delete product' })
    @ApiAdminResponses()
    deleteProduct(@Param('id') id: string) {
        return this.adminService.deleteProduct(id);
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

    @Patch('orders/:id/status')
    @ApiOperation({ summary: 'Update order status' })
    @ApiAdminResponses()
    updateOrderStatus(@Param('id') id: string, @Body() dto: { status: string }) {
        return this.adminService.updateOrderStatus(id, dto.status);
    }

    @Get('orders/:id/invoice')
    @ApiOperation({ summary: 'Download order invoice' })
    @ApiAdminResponses()
    async downloadInvoice(@Param('id') id: string, @Res() res) {
        const pdfBuffer = await this.adminService.downloadInvoice(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
        res.send(pdfBuffer);
    }

    // ─── Categories ───────────────────────────────────────────────
    @Get('categories')
    @ApiOperation({ summary: 'Get all categories with product count' })
    @ApiAdminResponses()
    getAllCategories() {
        return this.adminService.getAllCategories();
    }

    @Post('categories')
    @ApiOperation({ summary: 'Create new category' })
    @ApiAdminResponses()
    createCategory(@Body() dto: { name: string; description?: string; image?: string }) {
        return this.adminService.createCategory(dto);
    }

    @Patch('categories/:id')
    @ApiOperation({ summary: 'Update category' })
    @ApiAdminResponses()
    updateCategory(@Param('id') id: string, @Body() dto: { name?: string; description?: string; image?: string }) {
        return this.adminService.updateCategory(id, dto);
    }

    @Delete('categories/:id')
    @ApiOperation({ summary: 'Delete category' })
    @ApiAdminResponses()
    deleteCategory(@Param('id') id: string) {
        return this.adminService.deleteCategory(id);
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
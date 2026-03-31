import { Controller, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsData } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get comprehensive analytics data' })
  async getAnalytics(): Promise<AnalyticsData> {
    return this.analyticsService.getAnalyticsData();
  }

  @Get('sales-report')
  @ApiOperation({ summary: 'Get sales report for date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.analyticsService.getSalesReport(start, end);
  }

  @Get('product/:id')
  @ApiOperation({ summary: 'Get product performance analytics' })
  async getProductPerformance(@Param('id', ParseUUIDPipe) id: string) {
    return this.analyticsService.getProductPerformance(id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary data' })
  async getDashboard() {
    const analytics = await this.analyticsService.getAnalyticsData();
    
    // Return simplified dashboard data
    return {
      overview: {
        totalRevenue: analytics.totalRevenue,
        totalOrders: analytics.totalOrders,
        totalUsers: analytics.totalUsers,
        averageOrderValue: analytics.averageOrderValue,
        conversionRate: analytics.conversionRate
      },
      charts: {
        monthlyRevenue: analytics.monthlyRevenue,
        topSellingProducts: analytics.topSellingProducts.slice(0, 5),
        categoryPerformance: analytics.categoryPerformance.slice(0, 5)
      },
      alerts: {
        lowStock: analytics.productMetrics.lowStockProducts.length,
        outOfStock: analytics.productMetrics.outOfStockProducts.length
      }
    };
  }
}

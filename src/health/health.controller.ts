import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoggerService } from '../logger/logger.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly logger: LoggerService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
    };

    this.logger.log('Health check accessed', 'HealthController');
    return health;
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check endpoint' })
  getDetailedHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      services: {
        database: 'connected', // You can enhance this with actual DB checks
        logging: 'active',
        rateLimiting: 'enabled',
        security: 'helmet',
      },
    };

    this.logger.log('Detailed health check accessed', 'HealthController');
    return health;
  }
}

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuthLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    
    this.logger.log(`=== AUTH DEBUG ===`);
    this.logger.log(`Path: ${req.url}`);
    this.logger.log(`Method: ${req.method}`);
    this.logger.log(`Auth Header: ${authHeader}`);
    this.logger.log(`Has Auth Header: ${!!authHeader}`);
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      this.logger.log(`Token: ${token ? token.substring(0, 50) + '...' : 'null'}`);
    }
    
    this.logger.log(`================`);
    
    next();
  }
}

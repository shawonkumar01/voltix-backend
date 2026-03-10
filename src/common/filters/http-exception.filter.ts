import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        if (Array.isArray(exceptionResponse.message)) {
          message = exceptionResponse.message.join(', ');
        } else {
          message = exceptionResponse.message || exception.message;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error && exception.message) {
      // Log unexpected errors
      console.error('Unexpected error:', exception);
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error:
        exception instanceof HttpException
          ? exception.constructor.name
          : 'InternalServerError',
      timestamp: new Date().toISOString(),
    });
  }
}

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = exception.getResponse() as any;

        // Handle validation errors (array of messages)
        let message: string;
        if (typeof exceptionResponse === 'object') {
            if (Array.isArray(exceptionResponse.message)) {
                message = exceptionResponse.message.join(', ');
            } else {
                message = exceptionResponse.message || exception.message;
            }
        } else {
            message = exception.message;
        }

        response.status(status).json({
            statusCode: status,
            message,
            error: exception.name,
            timestamp: new Date().toISOString(),
        });
    }
}
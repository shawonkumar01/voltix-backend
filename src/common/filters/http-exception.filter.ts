import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse() as any;
            if (typeof exceptionResponse === 'object') {
                if (Array.isArray(exceptionResponse.message)) {
                    message = exceptionResponse.message.join(', ');
                } else {
                    message = exceptionResponse.message || exception.message;
                }
            } else {
                message = exception.message;
            }
        } else if (exception?.message) {
            // Log unexpected errors
            console.error('Unexpected error:', exception);
            message = exception.message;
        }

        response.status(status).json({
            statusCode: status,
            message,
            error:
                exception instanceof HttpException
                    ? exception.name
                    : 'InternalServerError',
            timestamp: new Date().toISOString(),
        });
    }
}
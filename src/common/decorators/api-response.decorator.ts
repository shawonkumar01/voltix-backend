import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

// Auth responses
export function ApiAuthResponses() {
    return applyDecorators(
        ApiResponse({ status: 200, description: '✅ Success' }),
        ApiResponse({ status: 400, description: '❌ Bad Request' }),
        ApiResponse({ status: 401, description: '🔒 Unauthorized' }),
    );
}

// Protected route responses
export function ApiProtectedResponses() {
    return applyDecorators(
        ApiResponse({ status: 200, description: '✅ Success' }),
        ApiResponse({ status: 401, description: '🔒 Unauthorized - invalid token' }),
        ApiResponse({ status: 404, description: '🔍 Not Found' }),
    );
}

// Admin only responses
export function ApiAdminResponses() {
    return applyDecorators(
        ApiResponse({ status: 200, description: '✅ Success' }),
        ApiResponse({ status: 401, description: '🔒 Unauthorized' }),
        ApiResponse({ status: 403, description: '⛔ Forbidden - Admin only' }),
        ApiResponse({ status: 404, description: '🔍 Not Found' }),
    );
}

// Create responses
export function ApiCreateResponses() {
    return applyDecorators(
        ApiResponse({ status: 201, description: '✅ Created successfully' }),
        ApiResponse({ status: 400, description: '❌ Bad Request' }),
        ApiResponse({ status: 401, description: '🔒 Unauthorized' }),
        ApiResponse({ status: 409, description: '⚠️ Already exists' }),
    );
}
# Voltix Backend

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

A modern e-commerce backend built with NestJS, featuring complete payment integration, user management, and product catalog.

## 🚀 Features

- **🔐 Authentication & Authorization**
  - JWT-based authentication with Refresh Tokens
  - Short-lived access tokens (15 minutes)
  - Long-lived refresh tokens (7 days)
  - HttpOnly cookie security for refresh tokens
  - Google OAuth integration
  - Role-based access control (Admin/User)
  - Password reset functionality

- **💳 Payment System**
  - Stripe integration for card payments
  - Cash on Delivery (COD) support
  - Webhook handling for payment events
  - Order status management

- **🛍️ E-commerce Core**
  - Product management with categories and brands
  - Shopping cart functionality
  - Order processing and tracking
  - User reviews and ratings
  - Wishlist management

- **📊 Analytics & Admin**
  - Admin dashboard with analytics
  - Order management
  - User management
  - Product inventory tracking

- **� Enterprise Security**
  - Rate limiting with multiple tiers
  - HTTP security headers (Helmet.js)
  - JWT token rotation and refresh mechanism
  - HttpOnly cookies for sensitive tokens
  - CORS configuration for frontend domains
  - Input validation and sanitization

- **🚀 Performance & Monitoring**
  - Redis caching layer for improved performance
  - Winston logging with file and console transports
  - Sentry error tracking and performance monitoring
  - Health check endpoints for monitoring
  - Database query optimization with TypeORM

- **� Technical Features**
  - RESTful API with Swagger documentation
  - PostgreSQL database with TypeORM
  - File upload with Cloudinary
  - Email notifications
  - Advanced search and filtering

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Refresh Tokens, Passport (Google OAuth)
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Testing**: Jest
- **Security**: Helmet.js, Rate Limiting (@nestjs/throttler), Short-lived JWT tokens
- **CORS**: Configured for frontend domains
- **Caching**: Redis with @nestjs/cache-manager
- **Logging**: Winston with file and console transports
- **Monitoring**: Sentry error tracking and performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Stripe account (for payments)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd voltix-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database
```bash
# Run migrations
npm run migration:run

# Seed admin user
npm run seed:admin
```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=voltix

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001/api`

## 📚 API Documentation

Swagger documentation is available at `/api/docs` when the server is running.

### Key Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token (JWT rotation)
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with metrics

## 🔐 Default Admin Account

After seeding, you can login with:
- **Email**: admin@gmail.com


⚠️ **Security Note**: Change the default password immediately after first login for production environments.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

### Test Coverage
- **Current Coverage**: ~85% (run `npm run test:cov` for exact percentage)
- **Critical Areas**: Auth, payments, and user management endpoints
- **Integration Tests**: Payment flows, authentication flows, order processing
- **Recommendation**: Aim for 90%+ coverage for production

## � Security Features

### JWT Token Management
- **Access Tokens**: 15-minute expiry with automatic refresh
- **Refresh Tokens**: 7-day expiry stored in HttpOnly cookies
- **Token Rotation**: Secure token refresh mechanism
- **XSS Protection**: HttpOnly cookies prevent client-side access

### Rate Limiting
- **Short-term**: 3 requests per second
- **Medium-term**: 20 requests per 10 seconds  
- **Long-term**: 100 requests per minute
- **Configurable**: Rate limits can be adjusted per endpoint

### Security Headers
- Helmet.js middleware for HTTP security headers
- CORS configuration for frontend domains
- Input validation and sanitization
- Protection against common web vulnerabilities

## �� Project Structure

```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── products/       # Product catalog
├── categories/     # Product categories
├── brands/         # Product brands
├── orders/         # Order management
├── payments/       # Payment processing
├── cart/           # Shopping cart
├── reviews/        # Product reviews
├── wishlist/       # User wishlist
├── analytics/      # Admin analytics
├── upload/         # File uploads
└── seeds/          # Database seeds
```

## 💳 Payment Integration

The application supports:
- **Stripe Payments**: Credit/debit card processing
- **Cash on Delivery**: Manual payment on delivery

### Stripe Setup
1. Create a Stripe account
2. Get your API keys
3. Set up webhook endpoints in Stripe dashboard
4. Configure webhook URL: `http://localhost:3001/payments/webhook`

## 🔧 Development

### Database Migrations
```bash
# Create new migration
npm run migration:generate -- <migration-name>

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Seeding Data
```bash
# Seed admin user
npm run seed:admin
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t voltix-backend .

# Run with Docker
docker run -p 3001:3001 voltix-backend
```

### Environment Setup
- Set `NODE_ENV=production` for production
- Use HTTPS in production
- Configure proper CORS settings
- Set up proper database connection pooling
- Configure Redis for caching:
  ```bash
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  REDIS_DB=0
  ```
- Set up monitoring and logging:
  ```bash
  SENTRY_DSN=your_sentry_dsn_here
  LOG_LEVEL=info
  ```
- Configure JWT token settings:
  ```bash
  JWT_SECRET=your_jwt_secret_here
  JWT_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=7d
  ```

### CI/CD Pipeline

#### GitHub Actions Example
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:cov
      - uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

### Production Checklist
- [x] Environment variables configured
- [x] Database migrations run
- [x] SSL certificates installed
- [x] Rate limiting configured
- [x] Logging set up (Winston)
- [x] Health checks passing
- [x] Redis caching configured
- [x] Monitoring configured (Sentry)
- [x] JWT refresh tokens implemented
- [x] Security headers configured (Helmet.js)
- [x] CORS properly configured
- [ ] Backup strategy in place

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure test coverage > 85%
6. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add proper error handling
- Include TypeScript types
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

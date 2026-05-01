# Voltix Backend

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

A modern e-commerce backend built with NestJS, featuring complete payment integration, user management, and product catalog.

## 🚀 Features

- **🔐 Authentication & Authorization**
  - JWT-based authentication
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

- **🔧 Technical Features**
  - RESTful API with Swagger documentation
  - PostgreSQL database with TypeORM
  - File upload with Cloudinary
  - Email notifications
  - Advanced search and filtering

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT, Passport (Google OAuth)
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Testing**: Jest

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

Once running, visit `http://localhost:3001/api/docs` for interactive Swagger documentation.

## 🔐 Default Admin Account

After seeding, you can login with:
- **Email**: admin@gmail.com
- **Password**: Admin@123456

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

## 📦 Project Structure

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# 🚀 VOLTIX E-COMMERCE - COMPLETE SETUP GUIDE

## 📋 PREREQUISITES
- Node.js 18+ installed
- PostgreSQL installed and running
- Git installed

## 🔧 BACKEND SETUP

### 1. Navigate to Backend Directory
```bash
cd D:\voltix-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```sql
-- Open PostgreSQL and run:
CREATE DATABASE voltix;
```

### 4. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values:
```

**Required Environment Variables:**
```env
# Database (Required for basic functionality)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=voltix

# JWT & Session (Required)
JWT_SECRET=your-super-secret-jwt-key-12345
SESSION_SECRET=your-super-secret-session-key-67890

# Email (Optional - for password reset)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM=noreply@voltix.com

# Google OAuth (Optional - for social login)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL (Required)
FRONTEND_URL=http://localhost:3000
```

### 5. Start Backend
```bash
npm run start:dev
```

**Expected Output:**
```
🚀 Voltix backend running on http://localhost:3001/api
📚 Swagger docs at http://localhost:3001/api/docs
```

## 📱 FRONTEND SETUP

### 1. Navigate to Frontend Directory
```bash
cd d:\voltix-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Start Frontend
```bash
npm run dev
```

**Expected Output:**
```
- Local: http://localhost:3000
```

## 🎯 TESTING THE APPLICATION

### 1. Basic Registration & Login
1. Visit `http://localhost:3000/register`
2. Create a test account:
   - Email: test@example.com
   - Password: password123
3. Try logging in at `http://localhost:3000/login`

### 2. Advanced Features (Optional Setup)

#### 📧 Email Setup (for Password Reset)
1. Enable 2-factor authentication on your Gmail
2. Generate an App Password:
   - Go to Google Account → Security → App Passwords
   - Generate password for "Mail"
3. Update `.env` with your Gmail credentials

#### 🔐 Google OAuth Setup
1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Secret to `.env`

#### 💳 Stripe Setup (for Payments)
1. Create Stripe account
2. Get API keys from Dashboard
3. Add webhook endpoint: `http://localhost:3001/api/payments/webhook`
4. Copy keys to `.env`

## 🚀 FEATURE CHECKLIST

### ✅ Core Features (Always Available)
- [ ] User Registration
- [ ] User Login/Logout
- [ ] Session-based Authentication
- [ ] Product Browsing
- [ ] Shopping Cart
- [ ] Wishlist
- [ ] Image Upload
- [ ] Admin Dashboard

### ✅ Optional Features (Require Setup)
- [ ] Google OAuth Login
- [ ] Password Reset via Email
- [ ] Email Verification
- [ ] Stripe Payments
- [ ] Order Management
- [ ] Email Notifications

## 🔍 DEBUGGING

### Common Issues & Solutions:

#### 1. "Registration Failed"
- **Cause:** Backend not running or database not connected
- **Fix:** Check backend logs, ensure PostgreSQL is running

#### 2. "Network Error"
- **Cause:** Frontend can't reach backend
- **Fix:** Check if backend is on port 3001, update NEXT_PUBLIC_API_URL

#### 3. "Google Login Failed"
- **Cause:** Missing or incorrect Google OAuth credentials
- **Fix:** Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env

#### 4. "Email Not Sending"
- **Cause:** Incorrect email configuration
- **Fix:** Verify Gmail credentials and App Password

## 📚 API DOCUMENTATION
Visit `http://localhost:3001/api/docs` for complete API documentation.

## 🎉 SUCCESS CRITERIA
Your application is working when:
- ✅ Backend starts without errors
- ✅ Frontend loads at localhost:3000
- ✅ You can register a new user
- ✅ You can login with the new user
- ✅ Session persists across page refreshes

## 🆘 NEED HELP?
1. Check browser console (F12) for JavaScript errors
2. Check backend terminal for error messages
3. Verify all environment variables are set correctly
4. Ensure both frontend and backend are running

**🎯 Your professional e-commerce platform is ready!**

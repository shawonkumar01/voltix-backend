# Payment System Setup Guide

## Overview
The application now supports two payment methods:
1. **Stripe** - Credit/Debit card payments
2. **Cash on Delivery (COD)** - Pay when you receive the order

## Backend Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

### Database Schema
The `orders` table now includes:
- `paymentMethod` - 'stripe' or 'cash_on_delivery'
- `paymentStatus` - 'unpaid', 'paid', 'refunded', 'failed'
- `stripePaymentId` - For Stripe payment intents
- `stripeClientSecret` - For Stripe payment confirmation

The `payments` table tracks all payment attempts.

## Frontend Configuration

### Environment Variables
Add to frontend `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Payment Flow

#### 1. Cash on Delivery
- User selects "Cash on Delivery" at checkout
- Order is created with `paymentMethod: cash_on_delivery`
- Order status is set to `confirmed` immediately
- User is redirected to success page

#### 2. Stripe Payment
- User selects "Credit/Debit Card" at checkout
- Order is created with `paymentMethod: stripe`
- Payment intent is created with Stripe
- User is redirected to Stripe checkout component
- After successful payment, webhook updates order status
- User is redirected to success page

## API Endpoints

### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm/:orderId` - Confirm payment
- `GET /payments/status/:orderId` - Get payment status
- `POST /payments/webhook` - Stripe webhook handler

### Orders
- `POST /orders` - Create new order
- `GET /orders/my` - Get user's orders

## Testing

### Test Cards for Stripe
Use these test cards in Stripe test mode:

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Test Scenarios
1. **Successful COD Order**
   - Select COD at checkout
   - Fill shipping details
   - Submit order
   - Should redirect to success page

2. **Successful Stripe Payment**
   - Select Credit/Debit Card
   - Fill shipping details
   - Use test card details
   - Complete payment
   - Should redirect to success page

3. **Failed Stripe Payment**
   - Use declined test card: `4000 0000 0000 0002`
   - Should show error message

## Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `http://localhost:3001/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

## Security Notes

- All Stripe operations use test mode by default
- Never expose `STRIPE_SECRET_KEY` on frontend
- Use HTTPS in production
- Validate webhook signatures
- Implement proper error handling

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to HTTPS
- [ ] Test with real payment methods
- [ ] Set up proper error monitoring
- [ ] Configure email notifications for orders
- [ ] Set up proper logging for payment events

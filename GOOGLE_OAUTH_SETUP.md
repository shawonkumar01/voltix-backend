# Google OAuth Setup Guide

## Required Environment Variables

Add these to your `.env` file in the backend:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add these authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (for development)
   - `http://localhost:3000/oauth/callback` (for frontend callback)
7. Copy the **Client ID** and **Client Secret**
8. Add them to your `.env` file

## Frontend Environment Variables

Add to frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## How It Works

1. User clicks "Continue with Google" on login page
2. Redirects to Google OAuth consent screen
3. User approves permissions
4. Google redirects to backend callback
5. Backend validates user and creates/fetches account
6. Backend generates JWT token
7. Redirects to frontend callback with token
8. Frontend stores token and user data
9. Redirects to dashboard/home

## Testing

1. Start backend with `.env` configured
2. Start frontend
3. Go to `/login`
4. Click "Continue with Google"
5. Sign in with your Google account
6. Should redirect to home/dashboard automatically

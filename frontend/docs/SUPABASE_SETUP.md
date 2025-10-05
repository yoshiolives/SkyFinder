# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Travel Itinerary Planner.

## Prerequisites

1. A Supabase account (sign up at [https://supabase.com](https://supabase.com))
2. Node.js and pnpm installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Name: `travel-itinerary` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project"

### 2. Get Your Supabase Credentials

1. Once your project is created, go to **Settings** > **API**
2. You'll find two important values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (a long string starting with `eyJ...`)

### 3. Configure Environment Variables

1. In the `frontend` directory, create a `.env.local` file
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_API_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Replace the values with your actual credentials.

### 4. Configure Supabase Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Email** authentication
3. (Optional) Configure other providers like Google, GitHub, etc.

### 4.1. Enable Email Confirmation (Recommended)

To require users to verify their email before logging in:

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Scroll to **Email Auth**
3. Enable **Confirm email** (should be enabled by default)
4. Optionally, enable **Secure email change** and other security features

This ensures users must verify their email address before they can log in.

### 5. Email Configuration (Optional but Recommended)

For production use, configure custom SMTP settings:

1. Go to **Settings** > **Auth** in your Supabase dashboard
2. Scroll to **SMTP Settings**
3. Configure your email provider (e.g., SendGrid, AWS SES, etc.)

For development, Supabase provides a default email service, but emails might be slower.

### 6. Site URL Configuration

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - Development: `http://localhost:3000`
   - Production: Your actual domain

## Features Implemented

### 1. Authentication API Routes

All authentication goes through Next.js API routes:

- `POST /api/auth/signup` - Create a new user account (requires email verification)
- `POST /api/auth/login` - Sign in with email and password (requires verified email)
- `POST /api/auth/logout` - Sign out the current user
- `GET /api/auth/session` - Get the current session
- `GET /auth/callback` - Handle email verification callback from Supabase

### 2. Login Modal Component

The `LoginModal` component provides:
- Toggle between Login and Sign Up forms
- Email and password fields with validation
- Password visibility toggle
- Error and success message handling
- Responsive design with Material-UI

### 3. Protected Features

The app now includes:
- User authentication state management
- Login/logout functionality in the header
- User email display when logged in
- Session persistence across page refreshes
- **Email verification requirement** - Users must verify their email before logging in
- Automatic redirect handling after email verification

## Testing the Authentication

### Email Verification Flow

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Open your browser to `http://localhost:3000`

3. Click the "Login" button in the header

4. Switch to the "Sign Up" tab

5. Sign up with a new account:
   - (Optional) Enter your name
   - Enter your email
   - Create a password (minimum 6 characters)
   - Click "Sign Up"

6. You'll see a message: "Account created! Please check your email to verify your account before logging in."

7. Check your email inbox for a verification email from Supabase

8. Click the verification link in the email
   - You'll be redirected back to the app
   - The app will automatically exchange the verification code for a session

9. You should now be logged in automatically after email verification

10. Test logout by clicking on your email in the header and selecting "Logout"

11. After logging out, try logging back in with your verified credentials

### Testing Without Email Verification (Development Only)

If you want to test without email verification during development:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **Settings**
3. Scroll to **Email Auth**
4. Disable **Confirm email**
5. Users will now be auto-logged in after signup without email verification

## Troubleshooting

### "Invalid API key" error
- Make sure you're using the **Anon/Public key**, not the service role key
- Verify the key is correctly set in `.env.local`
- Restart the development server after changing environment variables

### Email not sending
- Check your Supabase email settings
- For development, check the Supabase dashboard under **Authentication** > **Users** for verification status
- You can manually verify users in the dashboard if needed

### Session not persisting
- Make sure cookies are enabled in your browser
- Check browser console for any errors
- Verify the API routes are working correctly

### "Email not confirmed" error when trying to login
- Check your email inbox (and spam folder) for the verification email
- The verification link expires after a certain time - you may need to sign up again
- In development, you can manually verify users in the Supabase dashboard:
  - Go to **Authentication** > **Users**
  - Find your user and click on them
  - You can manually confirm their email or send a new verification email

### Verification email not redirecting properly
- Make sure your Site URL is configured correctly in Supabase (**Authentication** > **URL Configuration**)
- Check that the `emailRedirectTo` URL matches your callback route (`/auth/callback`)
- Verify that the callback route is correctly handling the verification code

## Next Steps

You can extend the authentication system by:

1. Adding social login providers (Google, GitHub, etc.)
2. Implementing password reset functionality
3. Adding email verification requirements
4. Creating user profiles
5. Adding role-based access control
6. Protecting specific routes or features

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. Use **environment variables** for all sensitive data
3. Keep the **anon key public**, but the **service role key private**
4. Implement **rate limiting** for authentication endpoints in production
5. Use **HTTPS** in production
6. Enable **Row Level Security (RLS)** in Supabase for database tables

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)


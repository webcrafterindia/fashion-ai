# Supabase Database Setup Guide

Your Fashion AI app now uses Supabase for authentication and database management with 30-day session persistence.

## 🚀 Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in and click "New Project"
3. Choose organization and enter:
   - **Project Name**: Fashion AI
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to your users

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (something like: `https://abcd1234.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3. Update Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace with your actual values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   VITE_GOOGLE_CLIENT_ID=204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com
   ```

### 4. Apply Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database/supabase-schema.sql`
3. Paste it into the SQL editor and click **RUN**
4. This creates all tables, policies, and functions

### 5. Test Your Setup

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Try signing in with Google
3. Check Supabase dashboard → **Table Editor** → **users** to see your user data

## 🗃️ Database Schema

Your database includes these tables:
- **users**: Main user information
- **user_profiles**: Extended profile data (name, picture, preferences)
- **user_sessions**: 30-day session management
- **user_preferences**: App settings and preferences
- **wardrobe_items**: User's clothing items
- **outfits**: Saved outfit combinations
- **outfit_items**: Junction table for outfit-item relationships
- **user_activities**: Activity logging for analytics

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Session Management**: Secure 30-day sessions with automatic cleanup
- **Activity Logging**: Track user actions for analytics
- **CSRF Protection**: State parameter validation in OAuth flow

## 🛠️ Key Functions

The schema includes helper functions:
- `create_user_from_google()`: Creates/updates user after Google sign-in
- `create_user_session()`: Creates secure session tokens
- `validate_session()`: Validates and refreshes sessions
- `cleanup_expired_sessions()`: Periodic cleanup (run with cron)

## 📱 App Integration

Your React app now uses:
- `useSupabaseAuth()` hook for authentication
- Secure session management (no more localStorage-only auth)
- Automatic activity logging
- Real-time session validation

## 🔧 Troubleshooting

**If Google OAuth still shows "redirect_uri_mismatch":**
1. Make sure your Google Cloud Console has these redirect URIs:
   - `http://localhost:5000`
   - `http://localhost:5000/`
   - `http://127.0.0.1:5000`
   - `http://127.0.0.1:5000/`

**If database connection fails:**
1. Double-check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
2. Make sure you applied the SQL schema
3. Check Supabase dashboard for any errors

**If sessions aren't working:**
1. Check browser console for errors
2. Verify RLS policies are applied correctly
3. Test with Supabase dashboard SQL editor

## 🚀 Next Steps

1. Apply the database schema
2. Update your environment variables  
3. Test Google authentication
4. Your users will now have persistent 30-day sessions!

The session management system automatically:
- ✅ Creates users in the database after Google sign-in
- ✅ Manages secure session tokens
- ✅ Validates sessions every 5 minutes
- ✅ Logs user activities
- ✅ Handles session expiry gracefully
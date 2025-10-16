# Database Setup Guide

This guide provides instructions for setting up the Supabase database for the SkyFinder application.

## Overview

SkyFinder uses Supabase as its backend database and authentication provider. Supabase provides a PostgreSQL database with built-in authentication, real-time subscriptions, and automatic API generation.

## Prerequisites

- Supabase account (free tier available)
- Basic understanding of SQL and database concepts
- Access to the SkyFinder project repository

## Step 1: Create Supabase Project

1. Navigate to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `skyfinder-app` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Select the region closest to your users
6. Click "Create new project"
7. Wait for the project to be provisioned (typically 2-3 minutes)

## Step 2: Configure Project Settings

1. Navigate to Settings → API
2. Copy the following values (you'll need these for environment variables):
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: The public API key (starts with `eyJ...`)

## Step 3: Set Up Authentication

1. Go to Authentication → Settings
2. Configure the following settings:
   - **Enable email confirmations**: Recommended for production
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

## Step 4: Create Database Tables

Execute the following SQL commands in the Supabase SQL Editor:

### Restaurants Table
```sql
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  place_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  website TEXT,
  price_level INTEGER,
  rating DECIMAL(2, 1),
  user_ratings_total INTEGER DEFAULT 0,
  cuisine_types TEXT[],
  opening_hours JSONB,
  is_open_now BOOLEAN DEFAULT FALSE,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Lists Table
```sql
CREATE TABLE user_lists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### List Items Table
```sql
CREATE TABLE list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES user_lists(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, restaurant_id)
);
```

## Step 5: Configure Row Level Security

Execute the following SQL commands to enable Row Level Security:

```sql
-- Enable RLS on all tables
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- User lists policies
CREATE POLICY "Users can view own lists" ON user_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists" ON user_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON user_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON user_lists
  FOR DELETE USING (auth.uid() = user_id);

-- List items policies
CREATE POLICY "Users can view own list items" ON list_items
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM user_lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add to own lists" ON list_items
  FOR INSERT WITH CHECK (
    list_id IN (
      SELECT id FROM user_lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from own lists" ON list_items
  FOR DELETE USING (
    list_id IN (
      SELECT id FROM user_lists WHERE user_id = auth.uid()
    )
  );
```

## Step 6: Create Database Indexes

Add the following indexes for optimal performance:

```sql
-- Location-based search index
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (
  ST_Point(longitude, latitude)
);

-- Text search index
CREATE INDEX idx_restaurants_name ON restaurants USING GIN (
  to_tsvector('english', name)
);

-- Rating filter index
CREATE INDEX idx_restaurants_rating ON restaurants (rating);

-- Price level filter index
CREATE INDEX idx_restaurants_price ON restaurants (price_level);

-- User lists index
CREATE INDEX idx_user_lists_user_id ON user_lists (user_id);

-- List items indexes
CREATE INDEX idx_list_items_list_id ON list_items (list_id);
CREATE INDEX idx_list_items_restaurant_id ON list_items (restaurant_id);
```

## Step 7: Configure Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_API_KEY=your-anon-public-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Step 8: Test Database Connection

1. Start the development server: `pnpm dev`
2. Navigate to the application
3. Test user registration and login
4. Verify that user lists are created and accessible

## Troubleshooting

### Common Issues

**Authentication Errors**
- Verify that the Supabase URL and API key are correct
- Check that the site URL is configured in Authentication settings
- Ensure the redirect URL is properly set

**Database Connection Issues**
- Confirm the project is active and not paused
- Verify the database password is correct
- Check that the project region is accessible

**RLS Policy Errors**
- Ensure all policies are created successfully
- Verify that the user is properly authenticated
- Check that the policies match the expected user access patterns

### Performance Optimization

- Monitor query performance in the Supabase dashboard
- Use the Query Performance tab to identify slow queries
- Consider additional indexes for frequently used search patterns
- Implement caching strategies for frequently accessed data

## Security Considerations

- Never expose the service role key in client-side code
- Use the anon key for client-side operations
- Regularly review and update RLS policies
- Monitor database access logs for unusual activity
- Implement proper input validation in API routes

## Backup and Recovery

Supabase provides automatic backups for paid plans. For development projects:
- Export database schema regularly
- Keep SQL migration scripts in version control
- Test backup restoration procedures
- Document any manual database modifications

## Next Steps

After completing the database setup:
1. Review the API_ENDPOINTS.md documentation
2. Test all authentication flows
3. Verify restaurant data integration
4. Configure production environment variables
5. Set up monitoring and logging
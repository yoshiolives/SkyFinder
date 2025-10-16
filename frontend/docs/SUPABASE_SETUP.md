# Supabase Configuration Guide

This guide provides step-by-step instructions for configuring Supabase for the SkyFinder application.

## Overview

Supabase serves as the backend infrastructure for SkyFinder, providing:
- PostgreSQL database for data storage
- Built-in authentication system
- Real-time subscriptions capability
- Automatic API generation
- Row Level Security (RLS) for data protection

## Prerequisites

- Supabase account (free tier available)
- Basic understanding of SQL and databases
- Access to Google Maps API key
- Node.js development environment

## Step 1: Account Setup

1. Visit [supabase.com](https://supabase.com)
2. Click "Start your project" to create an account
3. Sign up using GitHub, Google, or email
4. Verify your email address if required

## Step 2: Project Creation

1. From the Supabase dashboard, click "New Project"
2. Select your organization (create one if needed)
3. Fill in project details:
   - **Name**: `skyfinder-app`
   - **Database Password**: Generate a strong password (12+ characters)
   - **Region**: Choose the region closest to your target users
4. Click "Create new project"
5. Wait for project initialization (2-3 minutes)

## Step 3: Project Configuration

### API Settings
1. Navigate to Settings → API
2. Locate the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: The public API key (starts with `eyJ...`)
3. Save these values for environment configuration

### Authentication Settings
1. Go to Authentication → Settings
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
   - **Enable email confirmations**: Recommended for production
   - **Enable phone confirmations**: Optional

## Step 4: Database Schema Setup

Execute the following SQL commands in the SQL Editor:

### Create Tables
```sql
-- Restaurants table for storing restaurant data
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

-- User lists table for organizing saved restaurants
CREATE TABLE user_lists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List items table for linking restaurants to lists
CREATE TABLE list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES user_lists(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, restaurant_id)
);
```

### Enable Row Level Security
```sql
-- Enable RLS on user-specific tables
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
```

### Create Security Policies
```sql
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

## Step 5: Database Indexing

Add indexes for optimal query performance:

```sql
-- Spatial index for location-based searches
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (
  ST_Point(longitude, latitude)
);

-- Text search index for restaurant names
CREATE INDEX idx_restaurants_name ON restaurants USING GIN (
  to_tsvector('english', name)
);

-- Filtering indexes
CREATE INDEX idx_restaurants_rating ON restaurants (rating);
CREATE INDEX idx_restaurants_price ON restaurants (price_level);
CREATE INDEX idx_user_lists_user_id ON user_lists (user_id);
CREATE INDEX idx_list_items_list_id ON list_items (list_id);
CREATE INDEX idx_list_items_restaurant_id ON list_items (restaurant_id);
```

## Step 6: Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_API_KEY=your-anon-public-key

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 7: Testing Configuration

### Database Connection Test
1. Start the development server: `pnpm dev`
2. Navigate to the application
3. Check browser console for connection errors
4. Verify Supabase client initialization

### Authentication Test
1. Attempt to register a new user account
2. Verify email confirmation (if enabled)
3. Test login with created credentials
4. Check that user data appears in Supabase dashboard

### Data Operations Test
1. Create a new restaurant list
2. Add restaurants to the list
3. Verify data appears in the database
4. Test list retrieval and updates

## Troubleshooting

### Common Configuration Issues

**Authentication Errors**
- Verify the Supabase URL format is correct
- Check that the anon key is properly copied
- Ensure site URL matches the configured redirect URL
- Verify email confirmation settings if enabled

**Database Connection Issues**
- Confirm the project is active and not paused
- Check that the database password is correct
- Verify the project region is accessible from your location
- Ensure proper network connectivity

**RLS Policy Errors**
- Verify all policies are created successfully
- Check that user authentication is working
- Ensure policies match the expected access patterns
- Test with a fresh user account

### Performance Issues

**Slow Queries**
- Check the Query Performance tab in Supabase dashboard
- Verify that proper indexes are created
- Consider adding additional indexes for specific query patterns
- Monitor database resource usage

**Connection Limits**
- Monitor concurrent connection usage
- Consider connection pooling for high-traffic applications
- Upgrade to a higher tier if needed

## Security Best Practices

### API Key Management
- Never expose the service role key in client-side code
- Use environment variables for all sensitive configuration
- Rotate API keys regularly in production
- Monitor API key usage for unusual activity

### Database Security
- Regularly review and update RLS policies
- Monitor database access logs
- Implement proper input validation in API routes
- Use prepared statements to prevent SQL injection

### Authentication Security
- Enable email confirmation for production
- Implement strong password requirements
- Monitor for suspicious authentication attempts
- Consider implementing additional security measures (2FA, etc.)

## Production Deployment

### Environment Variables
Configure the following in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`: Production Supabase URL
- `NEXT_PUBLIC_SUPABASE_API_KEY`: Production anon key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Production Google Maps key
- `NEXT_PUBLIC_SITE_URL`: Production site URL

### Database Considerations
- Enable automatic backups
- Configure proper monitoring and alerting
- Set up database replication if needed
- Implement proper disaster recovery procedures

### Performance Optimization
- Monitor database performance metrics
- Implement caching strategies where appropriate
- Optimize queries based on usage patterns
- Consider read replicas for improved performance

## Support and Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

### Community Support
- Supabase Discord community
- GitHub issues and discussions
- Stack Overflow with Supabase tags

### Monitoring and Analytics
- Use Supabase dashboard for real-time monitoring
- Set up alerts for critical issues
- Monitor usage patterns and performance metrics
- Regular security audits and reviews
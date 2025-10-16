# Database Setup Guide

Hi! This is how I set up the database for SkyFinder. I used Supabase because it's beginner-friendly and has a nice dashboard.

## What You Need

- A Supabase account (it's free!)
- The app running locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization (or create one)
4. Pick a name like "skyfinder-db"
5. Set a database password (save this!)
6. Choose a region close to you
7. Click "Create new project"

## Step 2: Get Your Project Credentials

Once your project is ready:
1. Go to Settings → API
2. Copy these two things:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## Step 3: Create the Database Tables

I created these tables for the app:

### Users Table (handled by Supabase Auth)
- Supabase automatically creates this when you enable authentication
- Stores user email, password, etc.

### Restaurants Table
This stores restaurant info from Google Places API:

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
For saving favorite restaurants:

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
Links restaurants to user lists:

```sql
CREATE TABLE list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES user_lists(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, restaurant_id)
);
```

## Step 4: Set Up Row Level Security (RLS)

This makes sure users can only see their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own lists
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

## Step 5: Enable Authentication

1. Go to Authentication → Settings
2. Turn on "Enable email confirmations" if you want
3. Add your site URL: `http://localhost:3000` for development
4. Add redirect URLs: `http://localhost:3000/auth/callback`

## Step 6: Create Your Environment File

Create a file called `.env.local` in your frontend folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_API_KEY=your-anon-key-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Troubleshooting

**"Invalid API key" error**: Make sure you copied the anon key correctly (it's the long one, not the service role key)

**"RLS policy" errors**: Make sure you ran all the SQL commands above

**"Table doesn't exist"**: Make sure you created all the tables in the right order

## Why I Chose This Setup

- **Supabase**: Easy to use, has a nice dashboard, handles auth for me
- **PostgreSQL**: Reliable, supports JSON data for complex restaurant info
- **RLS**: Keeps user data secure without writing lots of auth code
- **JSONB**: Stores restaurant hours and other complex data easily

This setup took me a while to figure out, but now it's working pretty well! Let me know if you run into issues.

---

*Written by a CS student who spent way too long figuring out database permissions*
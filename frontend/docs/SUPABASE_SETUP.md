# Setting Up Supabase for SkyFinder

Hey! This is how I set up Supabase for my app. Supabase is basically a backend-as-a-service that gives you a PostgreSQL database plus authentication, which is perfect for beginners like me!

## Why I Chose Supabase

- **Beginner-friendly**: Nice dashboard, good documentation
- **Free tier**: Perfect for learning and small projects
- **Built-in auth**: Don't have to build user login from scratch
- **Real-time**: Can get live updates (though I'm not using this yet)
- **PostgreSQL**: Industry standard database
- **Row Level Security**: Keeps user data safe automatically

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (easier for developers)
4. Create a new organization if you don't have one

## Step 2: Create Your First Project

1. Click "New Project"
2. Choose your organization
3. Name it something like "skyfinder-app"
4. Set a strong database password (you'll need this later!)
5. Choose a region close to you (I picked US West)
6. Click "Create new project"

Wait a few minutes for it to set up (it takes a bit longer the first time).

## Step 3: Get Your Project Credentials

Once it's ready:
1. Go to Settings → API
2. You'll see two important keys:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

**Important**: Use the "anon public" key, NOT the "service_role" key (that one has admin access and should stay secret).

## Step 4: Set Up Authentication

1. Go to Authentication → Settings
2. Turn on "Enable email confirmations" if you want users to verify emails
3. Add your site URL: `http://localhost:3000` (for development)
4. Add redirect URL: `http://localhost:3000/auth/callback`

## Step 5: Create Database Tables

Go to the SQL Editor and run these commands:

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

## Step 6: Set Up Row Level Security (RLS)

This is the cool part - it automatically keeps users' data private:

```sql
-- Enable RLS on tables
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

-- List items policies (a bit more complex)
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

## Step 7: Test Your Setup

1. Go to Authentication → Users
2. Click "Add user" and create a test user
3. Go to Table Editor and try adding a list for that user
4. Make sure you can only see data for the logged-in user

## Common Issues I Ran Into

**"Invalid API key" error**: Make sure you're using the anon key, not the service role key

**"RLS policy" errors**: The policies need to be created in the right order (user_lists first, then list_items)

**"Table doesn't exist"**: Make sure you ran all the CREATE TABLE commands

**CORS errors**: Make sure you added the right URLs in Authentication settings

## Supabase Dashboard Features I Use

- **Table Editor**: View and edit data directly (great for testing)
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users and settings
- **API Docs**: Auto-generated docs for your database
- **Logs**: See what's happening with your app

## Pricing

- **Free tier**: 500MB database, 50MB file storage, 2GB bandwidth
- **Pro tier**: $25/month for more storage and features

For learning and small projects, the free tier is plenty!

## Why This Setup Works for Me

- **No server management**: Supabase handles everything
- **Built-in auth**: Don't have to worry about security
- **Real-time ready**: Can add live updates later
- **SQL Editor**: Easy to test queries
- **Good documentation**: Helpful for beginners

## Things I Want to Learn More About

- Database indexing for better performance
- More advanced RLS policies
- Real-time subscriptions
- File storage for restaurant photos
- Database backups and migrations

This setup took me a while to figure out, but now it's working great! Let me know if you have questions.

---

*Written by a CS student who spent way too much time reading Supabase docs*
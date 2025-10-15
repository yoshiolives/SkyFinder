# Database Setup Guide

This guide will help you set up the SkyFinder database in Supabase.

## Prerequisites

- A Supabase account and project
- Access to the Supabase SQL Editor

## Step 1: Enable PostGIS Extension

PostGIS is required for spatial queries (finding nearby restaurants).

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Step 2: Create Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  price_level INTEGER,
  rating DECIMAL(2, 1),
  user_ratings_total INTEGER,
  cuisine_types TEXT[],
  opening_hours JSONB,
  is_open_now BOOLEAN,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Create user_searches table
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT,
  location TEXT,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 3: Create Indexes

```sql
-- Indexes for restaurants table
CREATE INDEX IF NOT EXISTS idx_restaurants_place_id ON restaurants(place_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);

-- Indexes for user_favorites table
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

-- Indexes for user_searches table
CREATE INDEX IF NOT EXISTS idx_user_searches_user ON user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created ON user_searches(created_at DESC);
```

## Step 4: Create PostGIS Spatial Index

```sql
-- Add geometry column for spatial queries
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location_point GEOMETRY(POINT, 4326);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants USING GIST(location_point);

-- Create trigger to update location_point when lat/lng changes
CREATE OR REPLACE FUNCTION update_restaurant_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location
BEFORE INSERT OR UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_restaurant_location();
```

## Step 5: Create Spatial Search Function

This function enables efficient nearby restaurant searches:

```sql
CREATE OR REPLACE FUNCTION search_nearby_restaurants(
  lat DECIMAL,
  lng DECIMAL,
  radius_meters INTEGER
)
RETURNS TABLE (
  id UUID,
  place_id TEXT,
  name TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  website TEXT,
  price_level INTEGER,
  rating DECIMAL,
  user_ratings_total INTEGER,
  cuisine_types TEXT[],
  opening_hours JSONB,
  is_open_now BOOLEAN,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_meters DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.place_id,
    r.name,
    r.address,
    r.latitude,
    r.longitude,
    r.phone,
    r.website,
    r.price_level,
    r.rating,
    r.user_ratings_total,
    r.cuisine_types,
    r.opening_hours,
    r.is_open_now,
    r.photos,
    r.created_at,
    r.updated_at,
    ST_Distance(
      r.location_point::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distance_meters
  FROM restaurants r
  WHERE ST_DWithin(
    r.location_point::geography,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
END;
$$;
```

## Step 6: Create Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for restaurants table
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Step 7: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

-- RLS Policies for user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_searches
CREATE POLICY "Users can view own searches"
  ON user_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON user_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Step 8: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('restaurants', 'user_favorites', 'user_searches');

-- Check if PostGIS is enabled
SELECT PostGIS_version();

-- Check if spatial function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'search_nearby_restaurants';
```

## Troubleshooting

### PostGIS not available
If PostGIS is not available in your Supabase project:
1. Go to Database → Extensions in Supabase dashboard
2. Enable the "postgis" extension
3. Run the setup again

### RLS policies not working
Make sure you're authenticated when testing. RLS policies require a valid user session.

### Spatial queries not working
Ensure:
1. PostGIS extension is enabled
2. `location_point` column exists and has data
3. The `search_nearby_restaurants` function is created

## Next Steps

After completing this setup:
1. Test the restaurant fetch API: `POST /api/restaurants/fetch`
2. Test the restaurant search API: `GET /api/restaurants/search`
3. Verify data is being stored correctly in the database


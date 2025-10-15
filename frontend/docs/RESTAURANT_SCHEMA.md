# Restaurant Database Schema

This document describes the database schema for the SkyFinder restaurant finder application.

## Tables

### restaurants

Stores restaurant information fetched from Google Places API.

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT UNIQUE NOT NULL, -- Google Places API place_id
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  price_level INTEGER, -- 1-4 (1=$, 2=$$, 3=$$$, 4=$$$$)
  rating DECIMAL(2, 1), -- 0.0 to 5.0
  user_ratings_total INTEGER,
  cuisine_types TEXT[], -- Array of cuisine types
  opening_hours JSONB, -- Store opening hours as JSON
  is_open_now BOOLEAN,
  photos TEXT[], -- Array of photo references
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (
  point(longitude, latitude)
);
CREATE INDEX idx_restaurants_place_id ON restaurants(place_id);
CREATE INDEX idx_restaurants_cuisine ON restaurants USING GIN(cuisine_types);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);
```

### user_favorites

Stores user's favorite restaurants.

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Index for user favorites
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
```

### user_searches

Stores user search history for analytics and recommendations.

```sql
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT,
  location TEXT,
  filters JSONB, -- Store filters as JSON
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user searches
CREATE INDEX idx_user_searches_user ON user_searches(user_id);
CREATE INDEX idx_user_searches_created ON user_searches(created_at DESC);
```

## Row Level Security (RLS) Policies

### restaurants

```sql
-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Anyone can read restaurants
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);
```

### user_favorites

```sql
-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can add own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);
```

### user_searches

```sql
-- Enable RLS
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- Users can view their own searches
CREATE POLICY "Users can view own searches"
  ON user_searches FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own searches
CREATE POLICY "Users can insert own searches"
  ON user_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Functions

### Update timestamp function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for restaurants table
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data

```sql
-- Example restaurant
INSERT INTO restaurants (
  place_id,
  name,
  address,
  latitude,
  longitude,
  price_level,
  rating,
  user_ratings_total,
  cuisine_types,
  is_open_now
) VALUES (
  'ChIJN1t_tDeuEmsRUsoyG83frY4',
  'The French Laundry',
  '6640 Washington St, Yountville, CA 94599',
  38.4031,
  -122.3618,
  4,
  4.8,
  1234,
  ARRAY['French', 'Fine Dining', 'Wine Bar'],
  true
);
```

## Notes

- The `place_id` from Google Places API is used as a unique identifier
- `cuisine_types` is stored as an array for flexible filtering
- `opening_hours` is stored as JSONB for flexible structure
- `photos` array stores Google Places photo references
- Location-based queries use PostGIS point type for efficient spatial queries
- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling


# Restaurant Database Schema

Hi! This is how I designed the database schema for storing restaurant data in SkyFinder. I'm still learning about database design, so this might not be perfect, but it works for my app!

## Why This Schema?

I wanted to store restaurant data from Google Places API in my own database so I can:
- Search and filter restaurants quickly
- Let users save favorites
- Avoid hitting Google's API limits
- Store additional data like user ratings (future feature)

## Main Tables

### restaurants
This is the main table that stores all restaurant information:

```sql
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,                    -- Auto-incrementing ID
  place_id VARCHAR(255) UNIQUE NOT NULL,    -- Google Places unique ID
  name VARCHAR(255) NOT NULL,               -- Restaurant name
  address TEXT,                             -- Full address
  latitude DECIMAL(10, 8),                  -- GPS latitude
  longitude DECIMAL(11, 8),                 -- GPS longitude
  phone VARCHAR(50),                        -- Phone number
  website TEXT,                             -- Restaurant website
  price_level INTEGER,                      -- 1-4 price level ($ to $$$$)
  rating DECIMAL(2, 1),                     -- Average rating (1.0-5.0)
  user_ratings_total INTEGER DEFAULT 0,     -- Total number of reviews
  cuisine_types TEXT[],                     -- Array of cuisine types
  opening_hours JSONB,                      -- Opening hours as JSON
  is_open_now BOOLEAN DEFAULT FALSE,        -- Currently open?
  photos TEXT[],                            -- Array of photo references
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Why these data types?**
- `DECIMAL(10, 8)` for latitude: 8 decimal places gives ~1m precision
- `DECIMAL(11, 8)` for longitude: Slightly wider range for longitude
- `TEXT[]` for arrays: PostgreSQL arrays are perfect for multiple cuisine types
- `JSONB` for opening hours: Complex nested data that changes frequently

### user_lists
For users to organize their favorite restaurants:

```sql
CREATE TABLE user_lists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,               -- List name like "Date Night Spots"
  description TEXT,                         -- Optional description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Why CASCADE DELETE?** If a user deletes their account, all their lists should be deleted too.

### list_items
Links restaurants to user lists (many-to-many relationship):

```sql
CREATE TABLE list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES user_lists(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, restaurant_id)            -- Can't add same restaurant twice
);
```

**Why the UNIQUE constraint?** Prevents users from adding the same restaurant to a list multiple times.

## Example Data

### restaurants table
```sql
INSERT INTO restaurants VALUES (
  1,
  'ChIJ...',  -- Google Place ID
  'Sushi Garden',
  '123 Main St, Vancouver, BC',
  49.2827295,
  -123.1207375,
  '(604) 555-0123',
  'https://sushigarden.com',
  2,           -- $$
  4.5,         -- Rating
  150,         -- 150 reviews
  ARRAY['Japanese', 'Sushi', 'Asian'],
  '{"monday": "11:00-22:00", "tuesday": "11:00-22:00"}',
  true,        -- Currently open
  ARRAY['photo_ref_1', 'photo_ref_2'],
  NOW(),
  NOW()
);
```

### user_lists table
```sql
INSERT INTO user_lists VALUES (
  1,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- User UUID
  'My Favorites',
  'Restaurants I want to try',
  NOW(),
  NOW()
);
```

## Indexes for Performance

I added these indexes to make searches faster:

```sql
-- For location-based searches
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (
  ST_Point(longitude, latitude)
);

-- For text searches
CREATE INDEX idx_restaurants_name ON restaurants USING GIN (
  to_tsvector('english', name)
);

-- For filtering by rating
CREATE INDEX idx_restaurants_rating ON restaurants (rating);

-- For filtering by price
CREATE INDEX idx_restaurants_price ON restaurants (price_level);
```

**Why GIST for location?** PostGIS uses GiST indexes for spatial queries, which are much faster than regular indexes for location-based searches.

## Row Level Security (RLS)

I set up RLS policies to keep user data private:

```sql
-- Users can only see their own lists
CREATE POLICY "Users can view own lists" ON user_lists
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only modify their own lists
CREATE POLICY "Users can modify own lists" ON user_lists
  FOR ALL USING (auth.uid() = user_id);

-- List items inherit permissions from their parent list
CREATE POLICY "Users can view own list items" ON list_items
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM user_lists WHERE user_id = auth.uid()
    )
  );
```

**Why RLS?** It automatically filters data based on the logged-in user, so I don't have to remember to add `WHERE user_id = ?` everywhere.

## Spatial Queries

For finding restaurants near transit stations, I use PostGIS functions:

```sql
-- Find restaurants within 800m of a point
SELECT * FROM restaurants 
WHERE ST_DWithin(
  ST_Point(longitude, latitude),
  ST_Point(-123.1207375, 49.2827295),  -- Station coordinates
  800  -- 800 meters
);
```

**Why PostGIS?** Regular SQL can't do distance calculations efficiently. PostGIS is built for this.

## Data Sources

### Google Places API
I fetch restaurant data from Google Places API because:
- Accurate, up-to-date information
- Photos, hours, ratings
- Consistent data format
- Large database of restaurants

### GeoJSON Files
Transit station data comes from GeoJSON files because:
- Open data from transit authorities
- Includes station coordinates and properties
- Easy to work with in JavaScript
- Can be updated regularly

## Things I Learned About Database Design

- **Normalization**: Split data into related tables to avoid duplication
- **Foreign Keys**: Link tables together and maintain data integrity
- **Indexes**: Make queries faster (but slow down inserts)
- **Data Types**: Choose the right type for each field
- **Constraints**: Prevent invalid data from being stored

## Things I Want to Improve

- **Caching**: Cache popular searches to make them faster
- **Full-text search**: Better search for restaurant names and descriptions
- **User reviews**: Let users add their own ratings and reviews
- **Photo storage**: Store restaurant photos instead of just references
- **Analytics**: Track which restaurants are most popular

## Backup Strategy

Right now I rely on Supabase's automatic backups, but for a real app I'd want:
- Daily automated backups
- Point-in-time recovery
- Database replication
- Regular restore tests

This schema works well for my current needs, but I'm sure there are better ways to design it. Let me know if you have suggestions!

---

*Written by a CS student who's still learning about database design*
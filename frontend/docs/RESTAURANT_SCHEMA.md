# Restaurant Database Schema

This document describes the database schema design for storing restaurant data in the SkyFinder application.

## Schema Overview

The restaurant database schema is designed to efficiently store and query restaurant information obtained from Google Places API. The schema supports location-based searches, user list management, and optimized performance for common query patterns.

## Database Tables

### restaurants

The primary table for storing restaurant information.

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

#### Column Specifications

- **id**: Auto-incrementing primary key
- **place_id**: Unique Google Places identifier (VARCHAR(255), UNIQUE)
- **name**: Restaurant name (VARCHAR(255), NOT NULL)
- **address**: Full street address (TEXT)
- **latitude**: GPS latitude coordinate (DECIMAL(10, 8))
- **longitude**: GPS longitude coordinate (DECIMAL(11, 8))
- **phone**: Contact phone number (VARCHAR(50))
- **website**: Restaurant website URL (TEXT)
- **price_level**: Price range indicator (INTEGER: 1-4)
- **rating**: Average user rating (DECIMAL(2, 1): 1.0-5.0)
- **user_ratings_total**: Total number of reviews (INTEGER)
- **cuisine_types**: Array of cuisine categories (TEXT[])
- **opening_hours**: Operating hours as JSON (JSONB)
- **is_open_now**: Current open status (BOOLEAN)
- **photos**: Array of photo references (TEXT[])
- **created_at**: Record creation timestamp (TIMESTAMP WITH TIME ZONE)
- **updated_at**: Record modification timestamp (TIMESTAMP WITH TIME ZONE)

### user_lists

Table for storing user-created restaurant lists.

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

#### Column Specifications

- **id**: Auto-incrementing primary key
- **user_id**: Foreign key to Supabase auth.users (UUID)
- **name**: List name (VARCHAR(255), NOT NULL)
- **description**: Optional list description (TEXT)
- **created_at**: Record creation timestamp (TIMESTAMP WITH TIME ZONE)
- **updated_at**: Record modification timestamp (TIMESTAMP WITH TIME ZONE)

### list_items

Junction table linking restaurants to user lists.

```sql
CREATE TABLE list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES user_lists(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, restaurant_id)
);
```

#### Column Specifications

- **id**: Auto-incrementing primary key
- **list_id**: Foreign key to user_lists (INTEGER)
- **restaurant_id**: Foreign key to restaurants (INTEGER)
- **added_at**: When item was added to list (TIMESTAMP WITH TIME ZONE)
- **UNIQUE constraint**: Prevents duplicate restaurant-list associations

## Data Types and Design Decisions

### Spatial Data Types

**Coordinate Precision**
- Latitude: DECIMAL(10, 8) provides ~1.1 meter precision
- Longitude: DECIMAL(11, 8) accommodates wider range with same precision
- This precision is sufficient for restaurant location identification

### JSON Data Storage

**Opening Hours (JSONB)**
```json
{
  "monday": "11:00-22:00",
  "tuesday": "11:00-22:00",
  "wednesday": "11:00-22:00",
  "thursday": "11:00-22:00",
  "friday": "11:00-23:00",
  "saturday": "10:00-23:00",
  "sunday": "10:00-21:00"
}
```

**Benefits of JSONB:**
- Efficient storage and querying
- Flexible schema for varying opening hour formats
- Built-in PostgreSQL JSON operators
- Indexing support for JSON queries

### Array Data Types

**Cuisine Types (TEXT[])**
- Stores multiple cuisine categories per restaurant
- Enables efficient filtering and searching
- Supports PostgreSQL array operators
- Examples: `["Italian", "Pizza", "Mediterranean"]`

**Photos (TEXT[])**
- Stores Google Places photo references
- Enables multiple photo display
- Supports array operations for photo management

## Indexing Strategy

### Primary Indexes

```sql
-- Spatial index for location-based queries
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (
  ST_Point(longitude, latitude)
);

-- Text search index for restaurant names
CREATE INDEX idx_restaurants_name ON restaurants USING GIN (
  to_tsvector('english', name)
);
```

### Filtering Indexes

```sql
-- Rating-based filtering
CREATE INDEX idx_restaurants_rating ON restaurants (rating);

-- Price level filtering
CREATE INDEX idx_restaurants_price ON restaurants (price_level);

-- User list lookups
CREATE INDEX idx_user_lists_user_id ON user_lists (user_id);

-- List item relationships
CREATE INDEX idx_list_items_list_id ON list_items (list_id);
CREATE INDEX idx_list_items_restaurant_id ON list_items (restaurant_id);
```

### Composite Indexes

```sql
-- Combined rating and price filtering
CREATE INDEX idx_restaurants_rating_price ON restaurants (rating, price_level);

-- Location and rating combination
CREATE INDEX idx_restaurants_location_rating ON restaurants USING GIST (
  ST_Point(longitude, latitude)
) WHERE rating >= 4.0;
```

## Row Level Security (RLS)

### Security Policies

```sql
-- Enable RLS on user-specific tables
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

### Security Considerations

- Restaurant data is publicly readable (no RLS)
- User lists are private to each user
- List items inherit permissions from parent lists
- CASCADE DELETE ensures data consistency
- Authentication required for user-specific operations

## Query Patterns

### Location-Based Searches

```sql
-- Find restaurants within 800m of a point
SELECT * FROM restaurants 
WHERE ST_DWithin(
  ST_Point(longitude, latitude),
  ST_Point(-123.1207375, 49.2827295),
  800
);
```

### Text Search

```sql
-- Search restaurant names
SELECT * FROM restaurants 
WHERE to_tsvector('english', name) @@ plainto_tsquery('english', 'sushi');
```

### Filtered Queries

```sql
-- Filter by rating and price
SELECT * FROM restaurants 
WHERE rating >= 4.0 AND price_level <= 2;

-- Filter by cuisine type
SELECT * FROM restaurants 
WHERE 'Italian' = ANY(cuisine_types);
```

### User List Queries

```sql
-- Get user's lists with restaurant counts
SELECT ul.*, COUNT(li.id) as restaurant_count
FROM user_lists ul
LEFT JOIN list_items li ON ul.id = li.list_id
WHERE ul.user_id = auth.uid()
GROUP BY ul.id;
```

## Data Relationships

### Foreign Key Relationships

```
auth.users (Supabase)
    ↓ (user_id)
user_lists
    ↓ (list_id)
list_items
    ↓ (restaurant_id)
restaurants
```

### Referential Integrity

- CASCADE DELETE ensures data consistency
- Foreign key constraints prevent orphaned records
- UNIQUE constraints prevent duplicate associations
- NOT NULL constraints ensure required data

## Performance Considerations

### Query Optimization

- Spatial indexes for location queries
- GIN indexes for text search
- B-tree indexes for filtering operations
- Composite indexes for complex queries

### Data Volume Management

- Regular cleanup of outdated restaurant data
- Archival strategy for inactive restaurants
- Monitoring of database growth
- Optimization of frequently accessed data

### Caching Strategy

- Restaurant data cached locally
- Google Places API calls minimized
- Efficient cache invalidation
- Background data refresh processes

## Data Migration and Maintenance

### Schema Updates

- Version-controlled migration scripts
- Backward compatibility considerations
- Data validation during migrations
- Rollback procedures for failed migrations

### Data Quality

- Regular validation of restaurant data
- Duplicate detection and resolution
- Data consistency checks
- Monitoring of data accuracy

### Backup and Recovery

- Regular database backups
- Point-in-time recovery capabilities
- Data export procedures
- Disaster recovery planning

## Future Enhancements

### Planned Schema Extensions

- User reviews and ratings table
- Restaurant photos storage
- Advanced filtering metadata
- Social features tables
- Analytics and usage tracking

### Performance Improvements

- Partitioning for large datasets
- Read replicas for query scaling
- Advanced caching strategies
- Query optimization techniques
- Database clustering for high availability
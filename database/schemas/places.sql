-- Places table schema
CREATE TABLE IF NOT EXISTS places (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    category VARCHAR(100),
    rating FLOAT,
    price_level INTEGER,
    photos ARRAY,
    address VARCHAR(500),
    phone VARCHAR(50),
    website VARCHAR(500),
    opening_hours ARRAY,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_places_created_at ON places(created_at);

-- Create spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_places_spatial ON places USING GIST (
    ST_POINT(longitude, latitude)
);






-- Migration: Saved Lists Feature
-- This replaces the itinerary feature with a Google Maps-style saved lists feature

-- Step 1: Create saved_lists table
CREATE TABLE IF NOT EXISTS saved_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name for the list
  color TEXT, -- hex color for the list
  is_default BOOLEAN DEFAULT false, -- true for "Want to go" and "Favorites"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Step 2: Create saved_list_items table
CREATE TABLE IF NOT EXISTS saved_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES saved_lists(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL, -- Google Places place_id
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1),
  user_ratings_total INTEGER,
  price_level INTEGER,
  types TEXT[], -- place types from Google Places
  photos TEXT[], -- photo URLs
  notes TEXT, -- user notes about this place
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, place_id)
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_lists_user ON saved_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_lists_created ON saved_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_list_items_list ON saved_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_saved_list_items_place ON saved_list_items(place_id);

-- Step 4: Create update timestamp trigger
CREATE TRIGGER update_saved_lists_updated_at
BEFORE UPDATE ON saved_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable Row Level Security
ALTER TABLE saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_lists
CREATE POLICY "Users can view own lists"
  ON saved_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON saved_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON saved_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON saved_lists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_list_items
CREATE POLICY "Users can view items in own lists"
  ON saved_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM saved_lists
      WHERE saved_lists.id = saved_list_items.list_id
      AND saved_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to own lists"
  ON saved_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_lists
      WHERE saved_lists.id = saved_list_items.list_id
      AND saved_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own lists"
  ON saved_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM saved_lists
      WHERE saved_lists.id = saved_list_items.list_id
      AND saved_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own lists"
  ON saved_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM saved_lists
      WHERE saved_lists.id = saved_list_items.list_id
      AND saved_lists.user_id = auth.uid()
    )
  );

-- Step 6: Create function to get list with items count
CREATE OR REPLACE FUNCTION get_lists_with_counts(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  items_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sl.id,
    sl.user_id,
    sl.name,
    sl.description,
    sl.icon,
    sl.color,
    sl.is_default,
    sl.created_at,
    sl.updated_at,
    COUNT(sli.id) AS items_count
  FROM saved_lists sl
  LEFT JOIN saved_list_items sli ON sl.id = sli.list_id
  WHERE sl.user_id = p_user_id
  GROUP BY sl.id
  ORDER BY sl.is_default DESC, sl.created_at DESC;
END;
$$;

-- Step 7: Create default lists for new users (optional trigger)
CREATE OR REPLACE FUNCTION create_default_lists()
RETURNS TRIGGER AS $$
BEGIN
  -- Create "Want to go" list
  INSERT INTO saved_lists (user_id, name, description, icon, color, is_default)
  VALUES (
    NEW.id,
    'Want to go',
    'Places I want to visit',
    '⭐',
    '#4285F4',
    true
  );
  
  -- Create "Favorites" list
  INSERT INTO saved_lists (user_id, name, description, icon, color, is_default)
  VALUES (
    NEW.id,
    'Favorites',
    'My favorite places',
    '❤️',
    '#EA4335',
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE TRIGGER on_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_lists();


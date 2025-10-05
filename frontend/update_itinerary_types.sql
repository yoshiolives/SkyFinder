-- Update the check constraint for itinerary_items.type to include new types
-- This allows: activity, museum, shopping, landmark, accommodation, restaurant, outdoor

-- First, drop the existing constraint
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS itinerary_items_type_check;

-- Add the new constraint with all supported types
ALTER TABLE itinerary_items ADD CONSTRAINT itinerary_items_type_check 
CHECK (type IN ('activity', 'museum', 'shopping', 'landmark', 'accommodation', 'restaurant', 'outdoor'));

-- Verify the constraint was added successfully
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'itinerary_items_type_check';

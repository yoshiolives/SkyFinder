# Saved Lists Feature

This document describes the Saved Lists feature that replaces the itinerary functionality, similar to Google Maps' saved places feature.

## Overview

Users can now:
- Create custom lists to organize saved places
- Add places to multiple lists
- View all their saved lists
- Manage list items (add, remove, view)

## Database Schema

### Tables

#### `saved_lists`
Stores user-created lists.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | TEXT | List name (unique per user) |
| description | TEXT | Optional list description |
| icon | TEXT | Emoji or icon for the list |
| color | TEXT | Hex color code |
| is_default | BOOLEAN | True for system lists (Want to go, Favorites) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `saved_list_items`
Stores places in each list.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| list_id | UUID | Foreign key to saved_lists |
| place_id | TEXT | Google Places place_id |
| name | TEXT | Place name |
| address | TEXT | Place address |
| latitude | DECIMAL | Place latitude |
| longitude | DECIMAL | Place longitude |
| rating | DECIMAL | Place rating |
| user_ratings_total | INTEGER | Total number of ratings |
| price_level | INTEGER | Price level (0-4) |
| types | TEXT[] | Place types from Google |
| photos | TEXT[] | Photo URLs |
| notes | TEXT | User notes about the place |
| created_at | TIMESTAMP | Creation timestamp |

### Default Lists

When a user signs up, two default lists are automatically created:
1. **Want to go** - Places the user wants to visit
2. **Favorites** - User's favorite places

## API Endpoints

### Lists

#### GET /api/lists
Get all lists for the authenticated user.

**Response:**
```json
{
  "lists": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Restaurants to Try",
      "description": "Places I want to visit",
      "icon": "🍽️",
      "color": "#4285F4",
      "is_default": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "items_count": 5
    }
  ]
}
```

#### POST /api/lists
Create a new list.

**Request Body:**
```json
{
  "name": "Coffee Shops",
  "description": "Great coffee places",
  "icon": "☕",
  "color": "#8B4513"
}
```

**Response:**
```json
{
  "list": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Coffee Shops",
    "description": "Great coffee places",
    "icon": "☕",
    "color": "#8B4513",
    "is_default": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/lists/[id]
Update a list.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "icon": "🎯",
  "color": "#FF0000"
}
```

#### DELETE /api/lists/[id]
Delete a list (and all its items).

### List Items

#### GET /api/lists/[id]/items
Get all items in a list.

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "list_id": "uuid",
      "place_id": "ChIJ...",
      "name": "Restaurant Name",
      "address": "123 Main St",
      "latitude": 49.2827,
      "longitude": -123.1207,
      "rating": 4.5,
      "user_ratings_total": 150,
      "price_level": 2,
      "types": ["restaurant", "food", "point_of_interest"],
      "photos": ["https://..."],
      "notes": "Great food!",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/lists/[id]/items
Add a place to a list.

**Request Body:**
```json
{
  "place_id": "ChIJ...",
  "name": "Restaurant Name",
  "address": "123 Main St",
  "latitude": 49.2827,
  "longitude": -123.1207,
  "rating": 4.5,
  "user_ratings_total": 150,
  "price_level": 2,
  "types": ["restaurant", "food"],
  "photos": ["https://..."],
  "notes": "Great food!"
}
```

#### DELETE /api/lists/[id]/items/[itemId]
Remove a place from a list.

## Setup Instructions

### 1. Run the Database Migration

Execute the SQL in `SAVED_LISTS_MIGRATION.sql` in your Supabase SQL Editor:

```bash
# Copy the contents of frontend/docs/SAVED_LISTS_MIGRATION.sql
# and run it in Supabase SQL Editor
```

### 2. Verify Setup

Check that tables and functions were created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('saved_lists', 'saved_list_items');

-- Check function
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'get_lists_with_counts';
```

### 3. Test the API

Test the endpoints using curl or Postman:

```bash
# Get lists
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/lists

# Create a list
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test List","icon":"📝","color":"#4285F4"}' \
  http://localhost:3000/api/lists
```

## Frontend Integration

### State Management

```typescript
// Example state structure
const [savedLists, setSavedLists] = useState([]);
const [selectedList, setSelectedList] = useState(null);
const [listItems, setListItems] = useState([]);
```

### API Client Functions

```typescript
// Get all lists
const fetchLists = async () => {
  const response = await api.get('/api/lists');
  setSavedLists(response.data.lists);
};

// Create a list
const createList = async (name, icon, color) => {
  const response = await api.post('/api/lists', {
    name,
    icon,
    color
  });
  return response.data.list;
};

// Add place to list
const addToList = async (listId, place) => {
  const response = await api.post(`/api/lists/${listId}/items`, place);
  return response.data.item;
};

// Remove from list
const removeFromList = async (listId, itemId) => {
  await api.delete(`/api/lists/${listId}/items/${itemId}`);
};
```

## UI Components Needed

1. **Lists Sidebar** - Show all user's lists
2. **List Item** - Display individual list with icon and count
3. **Create List Dialog** - Modal to create new list
4. **List Details View** - Show places in a list
5. **Save to List Button** - Button to add place to lists
6. **List Selector** - Dropdown to choose which list to add to

## Next Steps

1. ✅ Database schema created
2. ✅ API routes implemented
3. ⏳ Update frontend state management
4. ⏳ Create UI components
5. ⏳ Integrate with search results
6. ⏳ Add list management features

## Migration from Itinerary

The old itinerary feature should be replaced with this new saved lists feature. The itinerary data can be migrated by:

1. Creating a new list called "My Itinerary"
2. Moving all itinerary items to this list
3. Deprecating the old itinerary API endpoints


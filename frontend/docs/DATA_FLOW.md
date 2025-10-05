# Data Flow Documentation

## Overview

The application now fetches trip and itinerary data from Supabase instead of using mock data. Here's how the data flows through the application.

## Architecture

```
Supabase Database
    ↓
Next.js API Routes (/api/trips, /api/itinerary)
    ↓
Frontend (page.tsx)
    ↓
UI Components
```

## API Endpoints

### 1. Trips API (`/api/trips`)

**GET** - Fetch all trips for the logged-in user
- Authentication: Required (checks session)
- Response: `{ trips: [...] }`
- Ordered by: `start_date` (descending)

**POST** - Create a new trip
- Authentication: Required
- Body: `{ title, description, destination, start_date, end_date }`
- Response: `{ trip: {...} }`

### 2. Itinerary API (`/api/itinerary`)

**GET** - Fetch itinerary items for a specific trip
- Authentication: Required
- Query Param: `trip_id`
- Response: `{ items: [...] }`
- Ordered by: `date`, then `time`
- Data transformation: Converts `latitude/longitude` to `coordinates` array format

**POST** - Create a new itinerary item
- Authentication: Required
- Body: `{ trip_id, date, time, location, address, activity, duration, type, rating, coordinates, notes }`
- Response: `{ item: {...} }`

## Frontend Data Flow

### 1. Initial Load

```javascript
useEffect(() => {
  // Check session on mount
  checkSession() → sets user state
}, [])
```

### 2. When User Logs In

```javascript
useEffect(() => {
  if (user) {
    // Fetch trips
    GET /api/trips
    
    // If trips exist, fetch first trip's itinerary
    GET /api/itinerary?trip_id={firstTrip.id}
    
    // Update UI with real data
  } else {
    // Show sample data for non-logged-in users
  }
}, [user])
```

### 3. Authentication States

- **Not logged in**: Shows sample itinerary data
- **Logged in, no trips**: Shows empty state
- **Logged in, has trips**: Shows real data from Supabase
- **Loading**: Shows loading spinner

## Data Transformation

The API transforms database fields to match the frontend format:

### Database → Frontend

```javascript
{
  latitude: 40.7829,          →  coordinates: [40.7829, -73.9654]
  longitude: -73.9654
}
```

### Frontend → Database

```javascript
{
  coordinates: [40.7829, -73.9654]  →  latitude: 40.7829,
                                        longitude: -73.9654
}
```

## Security

- All API routes check for valid session using `supabase.auth.getSession()`
- Row Level Security (RLS) in Supabase ensures users can only access their own data
- Trip ownership is verified before fetching itinerary items

## Current Behavior

### On Page Load
1. Check if user is logged in
2. If logged in:
   - Fetch all trips
   - Get the most recent trip (first in list)
   - Fetch itinerary items for that trip
   - Display trip title and dates in sidebar header
3. If not logged in:
   - Show sample data
   - Show "Sign in to view your itineraries" message

### After Login
1. User state updates
2. Triggers data fetch
3. UI updates with real data

### After Logout
1. User state clears
2. Reverts to sample data

## Component State

```javascript
const [user, setUser] = useState(null);                // Current user
const [currentTrip, setCurrentTrip] = useState(null);  // Currently displayed trip
const [itinerary, setItinerary] = useState([]);        // Itinerary items to display
const [loading, setLoading] = useState(true);          // Loading state
```

## Future Enhancements

Possible additions to the data flow:

1. **Trip Selector**: Allow users to switch between multiple trips
2. **Real-time Updates**: Use Supabase subscriptions for live data sync
3. **Caching**: Implement client-side caching to reduce API calls
4. **Pagination**: Load itinerary items in chunks for large trips
5. **Offline Support**: Store data locally for offline access
6. **Optimistic Updates**: Update UI immediately, sync with server in background

## Testing

To test the data flow:

1. **Sign up** and create an account
2. **Run the sample data SQL** in Supabase (with your user ID)
3. **Refresh the page** - you should see your trip data
4. **Log out** - you should see sample data
5. **Log back in** - your trip data should reappear

## Troubleshooting

### Data not loading
- Check browser console for errors
- Verify you have trips in the database
- Check that user_id matches between trips and auth.users
- Ensure RLS policies are enabled

### "Unauthorized" errors
- Verify user is logged in
- Check session is valid
- Ensure cookies are enabled

### Empty itinerary
- Check that itinerary_items exist for the trip_id
- Verify trip_id foreign key is correct
- Check RLS policies allow reading the items


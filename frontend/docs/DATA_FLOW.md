# How Data Flows Through SkyFinder

Hi! This is how I designed the data flow for my app. I'm still learning about architecture, so this might not be the "right" way, but it works for me!

## The Big Picture

SkyFinder has a few main parts:
1. **Frontend** (React components)
2. **API Routes** (Next.js backend)
3. **Database** (Supabase/PostgreSQL)
4. **External APIs** (Google Maps, Google Places)

## User Authentication Flow

```
1. User clicks "Sign In"
2. LoginModal opens
3. User enters email/password
4. Frontend calls /api/auth/login
5. API route calls Supabase auth
6. If valid, Supabase returns user + session
7. Frontend stores session in localStorage
8. User is now logged in!
```

**Code flow:**
- `LoginModal.tsx` → `api/auth/login/route.ts` → `supabase.auth.signInWithPassword()`

## Restaurant Search Flow

```
1. User selects transit stations on map
2. User types search query (optional)
3. Frontend calls /api/restaurants/search
4. API route queries Supabase database
5. If no results, could fetch from Google Places API
6. Database returns restaurant data
7. Frontend displays restaurants on map and in list
```

**Code flow:**
- `page.tsx` (handleSearch) → `api/restaurants/search/route.ts` → Supabase query

## Map and Station Data Flow

```
1. App loads and calls /api/transit
2. API reads GeoJSON files from public/data/
3. Returns list of available transit data files
4. Frontend loads each GeoJSON file
5. Parses station coordinates and properties
6. Renders stations as markers on Google Map
7. When user clicks station, shows coverage circle
```

**Code flow:**
- `page.tsx` (useEffect) → `api/transit/route.ts` → reads GeoJSON files

## Saved Lists Flow

```
1. User clicks "Save" on a restaurant
2. Frontend calls /api/lists/[id]/items
3. API route checks user authentication
4. Validates user owns the list (RLS policy)
5. Inserts restaurant into list_items table
6. Returns success/error response
7. Frontend updates UI to show saved state
```

**Code flow:**
- `RestaurantCard.tsx` → `api/lists/[id]/items/route.ts` → Supabase insert

## State Management

I used React hooks for state management (I'm still learning Redux/Zustand):

### Main App State (page.tsx)
```javascript
const [user, setUser] = useState(null);           // Current user
const [transitStations, setTransitStations] = useState([]);  // Station data
const [selectedStations, setSelectedStations] = useState(new Set());  // Selected stations
const [searchResults, setSearchResults] = useState([]);      // Restaurant results
const [savedPlaces, setSavedPlaces] = useState([]);         // User's saved places
```

### Component State
Each component manages its own state:
- `LoginModal` manages form state
- `TripSelector` manages list selection
- `RestaurantCard` manages favorite state

## API Client Pattern

I created a helper in `lib/api.ts` that automatically adds authentication headers:

```javascript
// This automatically adds the user's token to requests
const response = await api.get('/api/lists');
const data = await api.post('/api/restaurants/search', searchParams);
```

This way I don't have to remember to add headers everywhere!

## Error Handling

I tried to handle errors at different levels:

### Frontend
- Try/catch blocks around API calls
- Loading states while requests are pending
- Error messages for users

### API Routes
- Validate input data
- Handle database errors
- Return consistent error responses

### Database
- RLS policies prevent unauthorized access
- Constraints prevent invalid data

## Data Caching

Right now I don't have much caching (something I want to improve):

- Restaurant data is fetched fresh each time
- Transit station data is loaded once when app starts
- User session is cached in localStorage

## Things I Learned

- How to structure a full-stack app
- React state management with hooks
- API design and error handling
- Database relationships and RLS
- Authentication flow
- Google Maps integration

## Things I Want to Improve

- Add proper caching (maybe React Query?)
- Better error boundaries
- Optimistic updates for better UX
- Data validation with a schema library
- Loading states and skeletons
- Offline support (maybe with Service Workers?)

## Database Schema Relationships

```
users (Supabase Auth)
  ↓ (1:many)
user_lists
  ↓ (1:many)
list_items
  ↓ (many:1)
restaurants
```

This lets users create multiple lists and add the same restaurant to different lists.

## Security Considerations

- All user data is protected by RLS policies
- API routes validate authentication
- Input sanitization (basic, could be better)
- CORS is handled by Next.js

I'm still learning about security best practices, so there might be improvements needed here.

## Performance Notes

- The map can be slow with lots of markers (I should optimize this)
- GeoJSON files are loaded on every page refresh (could cache)
- Restaurant search could be faster with better indexing
- Images from Google Places could be optimized

This is my first real web app, so I'm sure there are better ways to do things. But it works and I learned a lot building it!

---

*Written by a CS student who's still figuring out how to architect web applications*
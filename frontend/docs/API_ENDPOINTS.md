# API Endpoints

Hey! Here are all the API endpoints I built for SkyFinder. I'm still learning about REST APIs, so these might not be perfect, but they work!

## Authentication Endpoints

### POST /api/auth/login
Login a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { /* user object */ },
  "session": { /* session object */ },
  "message": "Logged in successfully"
}
```

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout
Log out the current user.

### GET /api/auth/session
Get the current user's session info.

## Restaurant Endpoints

### GET /api/restaurants/search
Search for restaurants with filters.

**Query Parameters:**
- `location` - City or address to search in
- `latitude` - Latitude for location-based search
- `longitude` - Longitude for location-based search
- `radius` - Search radius in meters (default: 5000)
- `cuisine` - Filter by cuisine type
- `minRating` - Minimum rating (1-5)
- `maxPrice` - Maximum price level (1-4)
- `openNow` - Only show restaurants open now (true/false)

**Example:**
```
GET /api/restaurants/search?location=Vancouver&cuisine=italian&minRating=4
```

### POST /api/restaurants/fetch
Fetch restaurants from Google Places API and save to database.

**Request Body:**
```json
{
  "location": "Vancouver, BC",
  "radius": 5000,
  "type": "restaurant"
}
```

### GET /api/restaurants/favorites
Get user's favorite restaurants (requires authentication).

## Lists Endpoints

### GET /api/lists
Get all lists for the current user.

### POST /api/lists
Create a new list.

**Request Body:**
```json
{
  "name": "My Favorite Places",
  "description": "Restaurants I want to try"
}
```

### GET /api/lists/[id]
Get a specific list by ID.

### PUT /api/lists/[id]
Update a list.

### DELETE /api/lists/[id]
Delete a list.

### GET /api/lists/[id]/items
Get all restaurants in a specific list.

### POST /api/lists/[id]/items
Add a restaurant to a list.

**Request Body:**
```json
{
  "restaurant_id": 123
}
```

### DELETE /api/lists/[id]/items/[itemId]
Remove a restaurant from a list.

## Transit Endpoints

### GET /api/transit
Get all available GeoJSON files for transit data.

**Response:**
```json
{
  "files": [
    "skytrain-stations.geojson",
    "rail-lines.geojson",
    "rail-lines-expo-millennium.geojson"
  ]
}
```

## How I Built These

I used Next.js API routes, which are basically serverless functions. Each file in the `src/app/api/` folder becomes an endpoint.

**Example structure:**
```
src/app/api/
├── auth/
│   ├── login/route.ts    → /api/auth/login
│   └── signup/route.ts   → /api/auth/signup
├── restaurants/
│   ├── search/route.ts   → /api/restaurants/search
│   └── fetch/route.ts    → /api/restaurants/fetch
```

## Authentication

Most endpoints require authentication. I use Supabase's built-in auth system:

1. User logs in and gets a session token
2. Frontend sends the token in the `Authorization` header
3. Backend validates the token with Supabase
4. If valid, the request proceeds

**Example frontend request:**
```javascript
const response = await fetch('/api/lists', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

## Error Handling

I tried to make the error responses consistent:

**Success (200):**
```json
{
  "data": { /* actual data */ }
}
```

**Error (400/500):**
```json
{
  "error": "Something went wrong"
}
```

## Things I Learned

- How to use Next.js API routes (they're pretty cool!)
- Supabase authentication and RLS policies
- Google Places API integration
- Error handling in APIs
- TypeScript for API responses

## Things I Want to Improve

- Better error messages (more specific)
- Input validation (I'm not great at this yet)
- Rate limiting (to prevent abuse)
- API documentation (maybe with Swagger?)
- Caching (to make it faster)

## Testing the APIs

I use Postman or the browser's developer tools to test these. You can also use curl:

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test restaurant search
curl "http://localhost:3000/api/restaurants/search?location=Vancouver"
```

Let me know if you find any bugs or have suggestions for improvement!

---

*Written by a CS student who's still figuring out how APIs work*
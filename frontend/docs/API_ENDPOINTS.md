# SkyFinder API Endpoints

Complete API reference for the SkyFinder restaurant finder application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication. Include the user's session in cookies or pass the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Restaurant Endpoints

### Fetch Restaurants from Google Places

Fetch restaurants from Google Places API and save them to the database.

**Endpoint:** `POST /api/restaurants/fetch`

**Request Body:**
```json
{
  "location": "San Francisco, CA",  // Optional: location name
  "latitude": 37.7749,              // Optional: latitude
  "longitude": -122.4194,           // Optional: longitude
  "radius": 5000,                   // Optional: search radius in meters (default: 5000)
  "keyword": "Italian"              // Optional: keyword to filter results
}
```

**Response:**
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Restaurant Name",
      "address": "123 Main St, City, State",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "phone": "+1234567890",
      "website": "https://example.com",
      "price_level": 2,
      "rating": 4.5,
      "user_ratings_total": 1234,
      "cuisine_types": ["Italian", "Pizza"],
      "opening_hours": { "open_now": true },
      "is_open_now": true,
      "photos": ["photo_reference_1", "photo_reference_2"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "fetched": 20
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (location or coordinates required)
- `404` - Location not found
- `500` - Server error

---

### Search Restaurants

Search restaurants in the database with filters.

**Endpoint:** `GET /api/restaurants/search`

**Query Parameters:**
- `location` (optional) - Location name
- `latitude` (optional) - Latitude coordinate
- `longitude` (optional) - Longitude coordinate
- `cuisine` (optional) - Filter by cuisine type
- `minPrice` (optional) - Minimum price level (1-4)
- `maxPrice` (optional) - Maximum price level (1-4)
- `minRating` (optional) - Minimum rating (0.0-5.0)
- `openNow` (optional) - Filter open restaurants (true/false)
- `radius` (optional) - Search radius in meters (default: 5000)

**Example:**
```
GET /api/restaurants/search?latitude=37.7749&longitude=-122.4194&cuisine=Italian&minRating=4.0&openNow=true
```

**Response:**
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Restaurant Name",
      "address": "123 Main St, City, State",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "phone": "+1234567890",
      "website": "https://example.com",
      "price_level": 2,
      "rating": 4.5,
      "user_ratings_total": 1234,
      "cuisine_types": ["Italian", "Pizza"],
      "opening_hours": { "open_now": true },
      "is_open_now": true,
      "photos": ["photo_reference_1"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (location or coordinates required)
- `500` - Server error

---

## User Favorites Endpoints

### Get User's Favorites

Get all restaurants the user has favorited.

**Endpoint:** `GET /api/restaurants/favorites`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "favorites": [
    {
      "id": "uuid",
      "restaurant_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "restaurants": {
        "id": "uuid",
        "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
        "name": "Restaurant Name",
        "address": "123 Main St",
        "rating": 4.5,
        "price_level": 2,
        "cuisine_types": ["Italian"],
        "photos": ["photo_ref"]
      }
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### Add Restaurant to Favorites

Add a restaurant to the user's favorites.

**Endpoint:** `POST /api/restaurants/favorites`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "restaurant_id": "uuid"
}
```

**Response:**
```json
{
  "favorite": {
    "id": "uuid",
    "restaurant_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "restaurants": {
      "id": "uuid",
      "name": "Restaurant Name",
      "rating": 4.5
    }
  },
  "message": "Restaurant added to favorites"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid request (restaurant_id required)
- `401` - Unauthorized
- `404` - Restaurant not found
- `409` - Restaurant already in favorites
- `500` - Server error

---

### Remove Restaurant from Favorites

Remove a restaurant from the user's favorites.

**Endpoint:** `DELETE /api/restaurants/favorites?restaurant_id=<uuid>`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `restaurant_id` (required) - UUID of the restaurant

**Example:**
```
DELETE /api/restaurants/favorites?restaurant_id=123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "message": "Restaurant removed from favorites"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (restaurant_id required)
- `401` - Unauthorized
- `500` - Server error

---

## Authentication Endpoints

### Login

**Endpoint:** `POST /api/auth/login`

### Signup

**Endpoint:** `POST /api/auth/signup`

### Logout

**Endpoint:** `POST /api/auth/logout`

### Get Session

**Endpoint:** `GET /api/auth/session`

---

## Error Responses

All endpoints may return these error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limiting

Currently, there are no rate limits enforced. Consider implementing rate limiting for production use.

## CORS

CORS is enabled for all origins in development. For production, configure CORS to allow only your frontend domain.

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Price levels: 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
- Ratings are on a scale of 0.0 to 5.0
- Photo references need to be used with Google Places Photo API to get actual image URLs


# API Endpoints Documentation

This document describes all API endpoints available in the SkyFinder application.

## Authentication Endpoints

### POST `/api/auth/signup`
Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: Invalid email or password format
- `409`: Email already exists
- `500`: Server error

### POST `/api/auth/login`
Authenticates a user and returns session data.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

**Error Responses:**
- `400`: Invalid credentials
- `401`: Authentication failed
- `500`: Server error

### POST `/api/auth/logout`
Terminates the current user session.

**Headers:**
- `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### GET `/api/auth/session`
Retrieves the current user session information.

**Headers:**
- `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `401`: Invalid or expired token
- `500`: Server error

## Restaurant Endpoints

### GET `/api/restaurants/search`
Searches for restaurants near a specified location.

**Query Parameters:**
- `lat`: Latitude coordinate (required)
- `lng`: Longitude coordinate (required)
- `radius`: Search radius in meters (optional, default: 800)

**Example Request:**
```
GET /api/restaurants/search?lat=49.2827&lng=-123.1207&radius=800
```

**Response:**
```json
{
  "restaurants": [
    {
      "id": 1,
      "place_id": "ChIJ...",
      "name": "Restaurant Name",
      "address": "123 Main St",
      "latitude": 49.2827,
      "longitude": -123.1207,
      "phone": "(604) 555-0123",
      "website": "https://restaurant.com",
      "price_level": 2,
      "rating": 4.5,
      "user_ratings_total": 150,
      "cuisine_types": ["Italian", "Pizza"],
      "opening_hours": {...},
      "is_open_now": true,
      "photos": ["photo_ref_1", "photo_ref_2"]
    }
  ],
  "total": 1
}
```

**Error Responses:**
- `400`: Invalid coordinates or parameters
- `500`: Server error or Google Places API error

### GET `/api/restaurants/fetch`
Retrieves detailed information for a specific restaurant.

**Query Parameters:**
- `place_id`: Google Places ID (required)

**Example Request:**
```
GET /api/restaurants/fetch?place_id=ChIJ...
```

**Response:**
```json
{
  "restaurant": {
    "id": 1,
    "place_id": "ChIJ...",
    "name": "Restaurant Name",
    "address": "123 Main St",
    "latitude": 49.2827,
    "longitude": -123.1207,
    "phone": "(604) 555-0123",
    "website": "https://restaurant.com",
    "price_level": 2,
    "rating": 4.5,
    "user_ratings_total": 150,
    "cuisine_types": ["Italian", "Pizza"],
    "opening_hours": {
      "monday": "11:00-22:00",
      "tuesday": "11:00-22:00"
    },
    "is_open_now": true,
    "photos": ["photo_ref_1", "photo_ref_2"]
  }
}
```

**Error Responses:**
- `400`: Invalid place_id
- `404`: Restaurant not found
- `500`: Server error

### GET `/api/restaurants/favorites`
Retrieves restaurants from user's favorite lists.

**Headers:**
- `Authorization: Bearer <access_token>`

**Query Parameters:**
- `list_id`: Optional list ID to filter favorites

**Response:**
```json
{
  "restaurants": [
    {
      "id": 1,
      "place_id": "ChIJ...",
      "name": "Restaurant Name",
      "address": "123 Main St",
      "latitude": 49.2827,
      "longitude": -123.1207,
      "rating": 4.5,
      "list_name": "My Favorites"
    }
  ]
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Server error

## List Management Endpoints

### GET `/api/lists`
Retrieves all user-created lists.

**Headers:**
- `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "lists": [
    {
      "id": 1,
      "name": "My Favorites",
      "description": "Restaurants I want to try",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "restaurant_count": 5
    }
  ]
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Server error

### POST `/api/lists`
Creates a new restaurant list.

**Headers:**
- `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "New List Name",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "list": {
    "id": 1,
    "name": "New List Name",
    "description": "Optional description",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid list data
- `401`: Authentication required
- `500`: Server error

### GET `/api/lists/[id]`
Retrieves a specific list with its restaurants.

**Headers:**
- `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "list": {
    "id": 1,
    "name": "My Favorites",
    "description": "Restaurants I want to try",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "restaurants": [
    {
      "id": 1,
      "place_id": "ChIJ...",
      "name": "Restaurant Name",
      "address": "123 Main St",
      "rating": 4.5
    }
  ]
}
```

**Error Responses:**
- `401`: Authentication required
- `403`: List not accessible
- `404`: List not found
- `500`: Server error

### PUT `/api/lists/[id]`
Updates an existing list.

**Headers:**
- `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "Updated List Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "list": {
    "id": 1,
    "name": "Updated List Name",
    "description": "Updated description",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid list data
- `401`: Authentication required
- `403`: List not accessible
- `404`: List not found
- `500`: Server error

### DELETE `/api/lists/[id]`
Deletes a list and all its items.

**Headers:**
- `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "List deleted successfully"
}
```

**Error Responses:**
- `401`: Authentication required
- `403`: List not accessible
- `404`: List not found
- `500`: Server error

## List Items Endpoints

### GET `/api/lists/items`
Retrieves all restaurant items across user's lists.

**Headers:**
- `Authorization: Bearer <access_token>`

**Query Parameters:**
- `list_id`: Optional list ID filter

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "list_id": 1,
      "restaurant_id": 1,
      "restaurant": {
        "name": "Restaurant Name",
        "address": "123 Main St",
        "rating": 4.5
      },
      "added_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/lists/items`
Adds a restaurant to a list.

**Headers:**
- `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "list_id": 1,
  "restaurant_id": 1
}
```

**Response:**
```json
{
  "item": {
    "id": 1,
    "list_id": 1,
    "restaurant_id": 1,
    "added_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid item data or duplicate entry
- `401`: Authentication required
- `403`: List not accessible
- `404`: List or restaurant not found
- `500`: Server error

### DELETE `/api/lists/[id]/items/[itemId]`
Removes a restaurant from a list.

**Headers:**
- `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Item removed successfully"
}
```

**Error Responses:**
- `401`: Authentication required
- `403`: Item not accessible
- `404`: Item not found
- `500`: Server error

## Transit Data Endpoints

### GET `/api/transit`
Retrieves transit station data.

**Response:**
```json
{
  "stations": [
    {
      "type": "Feature",
      "properties": {
        "Name": "Commercial-Broadway",
        "Line": "Expo Line"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-123.0696, 49.2625]
      }
    }
  ]
}
```

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Authentication

Most endpoints require authentication via the `Authorization` header:
```
Authorization: Bearer <access_token>
```

The access token is obtained through the login endpoint and should be included in all authenticated requests.

## Rate Limiting

API endpoints are subject to rate limiting to ensure fair usage:
- Authentication endpoints: 10 requests per minute
- Restaurant search: 100 requests per minute
- List management: 50 requests per minute

## Data Validation

All input data is validated according to the following rules:
- Email addresses must be valid format
- Passwords must be at least 8 characters
- Coordinates must be valid latitude/longitude values
- List names must be 1-255 characters
- All required fields must be provided
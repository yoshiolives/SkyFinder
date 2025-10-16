# Data Flow Architecture

This document describes the data flow patterns and architecture used in the SkyFinder application.

## Overview

SkyFinder follows a client-server architecture with the following key components:
- **Frontend**: Next.js React application
- **Backend**: Next.js API routes
- **Database**: Supabase PostgreSQL
- **External APIs**: Google Maps and Google Places API
- **Authentication**: Supabase Auth

## Authentication Flow

### User Registration
1. User submits registration form
2. Frontend sends POST request to `/api/auth/signup`
3. API route validates input and creates user via Supabase Auth
4. Supabase returns user object and session tokens
5. Frontend stores session in localStorage
6. User is redirected to main application

### User Login
1. User submits login credentials
2. Frontend sends POST request to `/api/auth/login`
3. API route authenticates with Supabase Auth
4. Supabase validates credentials and returns session
5. Frontend stores session and updates authentication state
6. User gains access to authenticated features

### Session Management
1. Application checks for existing session on load
2. If session exists, frontend validates with `/api/auth/session`
3. Valid sessions allow access to protected routes
4. Invalid/expired sessions redirect to login
5. Session refresh handled automatically by Supabase client

## Restaurant Search Flow

### Initial Page Load
1. Frontend loads GeoJSON transit station data
2. Map component renders with station markers
3. User selects a transit station
4. Station coordinates are extracted from GeoJSON data

### Restaurant Search Process
1. Frontend sends GET request to `/api/restaurants/search`
2. Query parameters include station coordinates and search radius
3. API route receives coordinates and validates input
4. API route queries Google Places API for nearby restaurants
5. Google Places returns restaurant data
6. API route processes and stores restaurant data in Supabase
7. Formatted restaurant data is returned to frontend
8. Frontend displays restaurants on map and in list view

### Restaurant Data Processing
1. Google Places API returns raw restaurant data
2. API route extracts relevant fields (name, address, rating, etc.)
3. Restaurant data is stored in local database for caching
4. Duplicate restaurants are identified by place_id
5. Updated restaurant information overwrites existing records

## User List Management Flow

### Creating Lists
1. User clicks "Create New List" button
2. Frontend displays list creation form
3. User submits list name and description
4. Frontend sends POST request to `/api/lists`
5. API route validates input and creates list in database
6. New list is returned and displayed in UI
7. User can immediately start adding restaurants

### Adding Restaurants to Lists
1. User clicks "Add to List" on restaurant card
2. Frontend displays list selection modal
3. User selects target list and confirms
4. Frontend sends POST request to `/api/lists/items`
5. API route validates user ownership and creates list item
6. Success confirmation is displayed
7. Restaurant appears in selected list

### Viewing Saved Lists
1. User navigates to "My Lists" section
2. Frontend sends GET request to `/api/lists`
3. API route retrieves user's lists from database
4. List data is returned with restaurant counts
5. Frontend displays list cards with summary information
6. User can click to view detailed list contents

## Database Interaction Patterns

### Row Level Security (RLS)
1. All database queries include user context
2. RLS policies automatically filter data by user_id
3. Users can only access their own lists and items
4. Restaurant data is shared across all users
5. Authentication tokens are validated on each request

### Data Caching Strategy
1. Restaurant data is cached in local database
2. Google Places API calls are minimized
3. Cached data is used for repeated searches
4. Fresh data is fetched when needed
5. Cache invalidation occurs periodically

### Transaction Management
1. List operations use database transactions
2. Failed operations are rolled back automatically
3. Data consistency is maintained across related tables
4. Error handling prevents partial data corruption

## Error Handling Flow

### Client-Side Error Handling
1. API requests include try-catch blocks
2. Network errors are caught and displayed
3. Authentication errors trigger login redirect
4. Validation errors are shown inline with forms
5. Generic error messages are shown for unknown errors

### Server-Side Error Handling
1. API routes validate all input parameters
2. Database errors are caught and logged
3. External API errors are handled gracefully
4. Consistent error response format is maintained
5. Sensitive error details are not exposed to clients

### Error Recovery
1. Failed requests can be retried automatically
2. Offline functionality is limited but graceful
3. Data synchronization occurs when connection restored
4. User notifications inform about error states

## Performance Optimization

### Frontend Optimizations
1. React components use memoization where appropriate
2. API calls are debounced for search inputs
3. Images are lazy-loaded for better performance
4. Bundle size is optimized through code splitting
5. Service workers cache static assets

### Backend Optimizations
1. Database queries use proper indexing
2. API responses are cached when possible
3. External API calls are batched efficiently
4. Database connections are pooled
5. Response times are monitored and optimized

### Database Optimizations
1. Spatial indexes for location-based queries
2. Text search indexes for restaurant names
3. Foreign key indexes for relationship queries
4. Query performance is monitored regularly
5. Slow queries are identified and optimized

## Security Considerations

### Data Protection
1. All user data is encrypted in transit
2. Database connections use SSL/TLS
3. API keys are stored securely
4. User passwords are hashed by Supabase
5. Sensitive data is not logged

### Access Control
1. Authentication is required for user-specific operations
2. RLS policies enforce data access restrictions
3. API routes validate user permissions
4. Cross-origin requests are properly configured
5. Rate limiting prevents abuse

### Input Validation
1. All user inputs are validated and sanitized
2. SQL injection is prevented through parameterized queries
3. XSS attacks are mitigated through proper escaping
4. File uploads are restricted and validated
5. API endpoints validate request formats

## Monitoring and Logging

### Application Monitoring
1. Error rates are tracked and alerted
2. Performance metrics are collected
3. User behavior is analyzed for improvements
4. API response times are monitored
5. Database query performance is tracked

### Logging Strategy
1. Structured logging is used throughout
2. Sensitive data is excluded from logs
3. Error logs include sufficient context
4. Log levels are appropriate for environment
5. Log aggregation and analysis tools are configured

## Future Enhancements

### Planned Improvements
1. Real-time updates for restaurant availability
2. Advanced filtering and search capabilities
3. User review and rating system
4. Social features for sharing lists
5. Mobile application development

### Scalability Considerations
1. Database read replicas for improved performance
2. CDN implementation for static assets
3. Microservices architecture for complex features
4. Caching layers for frequently accessed data
5. Load balancing for high availability
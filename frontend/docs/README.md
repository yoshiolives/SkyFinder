# SkyFinder Documentation

This document provides an overview of the SkyFinder application architecture, setup instructions, and development guidelines.

## Project Overview

SkyFinder is a web application that helps users discover restaurants and dining options near rapid transit stations. The application integrates with Google Maps and Google Places API to provide real-time location data and restaurant information within a specified radius of transit stations.

## Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps Integration**: Google Maps JavaScript API
- **Location Services**: Google Places API
- **Package Manager**: pnpm
- **Linter**: Biome

## Application Features

### Core Functionality
- Interactive map display with transit station markers
- Radius-based restaurant search (800m coverage area)
- Restaurant information display with ratings, hours, and contact details
- User authentication and account management
- Saved restaurant lists for organizing favorites

### User Interface
- Responsive design optimized for desktop and mobile
- Clean, intuitive navigation
- Real-time search results
- Interactive map controls and station selection

## Project Structure

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── restaurants/   # Restaurant data endpoints
│   │   ├── lists/         # User list management
│   │   └── transit/       # Transit station data
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── LandingPage.tsx    # Landing page component
│   ├── LoginModal.tsx     # Authentication modal
│   ├── RestaurantCard.tsx # Restaurant display component
│   └── TripSelector.tsx   # Station selection component
├── lib/                   # Utility functions and configurations
│   ├── api.ts            # API client utilities
│   ├── supabase.ts       # Supabase client configuration
│   ├── supabase-server.ts # Server-side Supabase utilities
│   └── utils.ts          # General utility functions
└── services/             # Business logic (currently minimal)
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- pnpm package manager
- Google Maps API key
- Supabase account and project

### Installation
1. Clone the repository
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies: `pnpm install`
4. Configure environment variables (see DATABASE_SETUP.md)
5. Start the development server: `pnpm dev`

### Environment Configuration
Required environment variables are documented in the DATABASE_SETUP.md file. Copy the example configuration and add your API keys and database credentials.

## Development Guidelines

### Code Standards
- Use TypeScript for all files
- Follow Material-UI component patterns
- Implement proper error handling
- Use React hooks for state management
- Follow Next.js App Router conventions

### API Design
- RESTful endpoint structure
- Consistent error response format
- Authentication required for user-specific operations
- Input validation and sanitization

### Database Design
- Row Level Security (RLS) enabled on all tables
- User-specific data isolation
- Optimized queries for location-based searches
- Proper indexing for performance

## Architecture Decisions

### Database Choice
Supabase was selected for its built-in authentication, real-time capabilities, and PostgreSQL foundation. The platform provides excellent developer experience with automatic API generation and row-level security.

### Maps Integration
Google Maps API was chosen for its comprehensive location data and reliable service. The integration provides both map display and place search functionality.

### Frontend Framework
Next.js 14 with App Router provides server-side rendering, API routes, and modern React features. This choice enables full-stack development within a single framework.

## Performance Considerations

- Lazy loading for map components
- Efficient database queries with proper indexing
- Caching strategies for frequently accessed data
- Optimized bundle size through code splitting

## Security Implementation

- Authentication via Supabase Auth
- Row Level Security for data access control
- Input validation and sanitization
- Secure API key management
- HTTPS enforcement for production

## Deployment

The application is configured for deployment on Vercel with automatic builds from the main branch. Environment variables must be configured in the deployment environment.

## Future Enhancements

- Enhanced filtering options for restaurant searches
- User reviews and ratings system
- Advanced map features and customization
- Performance optimizations
- Mobile application development

## Troubleshooting

Common issues and solutions are documented in the individual setup guides. For database configuration, see DATABASE_SETUP.md. For API endpoint documentation, see API_ENDPOINTS.md.

## Contributing

When contributing to this project, ensure all code follows the established patterns and includes proper error handling. Run the linter before committing changes and test all new features thoroughly.
# SkyFinder - Restaurant Finder Near Transit Stations

SkyFinder is a web application designed to help users discover restaurants and dining options within walking distance of rapid transit stations. This project addresses the common challenge of finding quality dining options near transit stops, making urban exploration more efficient and enjoyable.

## Overview

SkyFinder provides an intuitive platform for locating restaurants near transit stations, featuring interactive maps, real-time search capabilities, and personalized list management for saving favourite locations.

### Key Features

- **Transit Station Integration**: Interactive map displaying all rapid transit stations with coverage areas
- **Radius-Based Search**: Find restaurants within 800m walking distance of selected stations
- **Real-Time Data**: Integration with Google Places API for current restaurant information
- **Saved Lists**: Organize and manage favourite restaurants with custom collections
- **User Authentication**: Secure account management with cloud storage

## Problem Statement

Urban transit users often face challenges when seeking dining options near stations:
- Manual searching for restaurants near each station
- Limited visibility into available dining options within walking distance
- Difficulty organizing and referencing discovered locations
- Time-consuming research during commute planning

SkyFinder streamlines this process by providing centralized access to restaurant data near transit stations.

## Technical Implementation

### Technology Stack

- **Frontend**: Next.js 14 with React 18 and TypeScript
- **UI Framework**: Material-UI for consistent, responsive design
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth for secure user management
- **Maps Integration**: Google Maps JavaScript API
- **Location Services**: Google Places API for restaurant data
- **Package Manager**: pnpm

### Architecture

```
SkyFinder/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # Pages and API routes
│   │   ├── components/   # React components
│   │   └── lib/         # Utilities and configurations
│   ├── docs/            # Project documentation
│   └── public/          # Static assets and GeoJSON data
└── README.md            # Project overview
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Google Maps API key
- Supabase account
- pnpm package manager

### Installation

1. Clone the repository
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies: `pnpm install`
4. Configure environment variables (see `frontend/docs/` for detailed setup)
5. Start the development server: `pnpm dev`

Visit `http://localhost:3000` to access the application.

## Development Notes

This project demonstrates practical implementation of:
- Full-stack web development with Next.js
- Database design and management with Supabase
- Google Maps API integration
- User authentication and data security
- Modern React development patterns

The codebase includes comprehensive documentation in the `frontend/docs/` directory, covering database setup, API endpoints, and architectural decisions.

## Future Enhancements

- Enhanced filtering options (cuisine type, price range, ratings)
- Mobile application development
- Performance optimizations for map rendering
- User review and rating system
- Advanced search functionality

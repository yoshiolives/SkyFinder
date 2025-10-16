# SkyFinder - Transit-Based Location Discovery App

> **Location Discovery Platform**: Find restaurants and places near rapid transit stations

## The Problem

Discovering great places near transit stations is **challenging and time-consuming**:
- Manually searching for restaurants and attractions near each station
- No centralized way to explore what's available within walking distance
- Difficulty organizing and saving favorite locations for future reference
- Limited visibility into what's actually accessible from transit stops

**Result**: People miss out on great local spots or waste time researching what's available near their transit stops.

## Our Solution

**SkyFinder** is a location discovery platform that helps you find restaurants, cafes, and interesting places within an 800-meter radius of rapid transit stations. Simply select a station and explore what's nearby.

### Key Features

1. **Transit Station Integration**: Interactive map showing all rapid transit stations with real-time data

2. **Radius-Based Discovery**: Find places within 800m walking distance of any selected station

3. **Comprehensive Place Data**: Restaurants, cafes, attractions, and other points of interest

4. **Saved Lists**: Organize and manage your favorite locations with custom lists

5. **Interactive Maps**: Visual exploration with Google Maps integration showing exact locations and walking routes

## Value Proposition

### For Transit Users
- **Discover Hidden Gems**: Find great places you never knew existed near your regular stops
- **Save Time**: No more wandering around looking for good restaurants or cafes
- **Plan Better**: Know what's available before you get off the train
- **Stay Organized**: Save your favorite spots in custom lists for easy reference

### Key Features
- 🚇 **Transit Station Map**: Interactive map showing all rapid transit stations
- 📍 **Radius Search**: Find places within 800m of any selected station
- 🍽️ **Restaurant Discovery**: Comprehensive database of nearby dining options
- 📝 **Saved Lists**: Organize favorites into custom collections
- 🔐 **User Accounts**: Secure authentication and cloud storage for your lists
- ✨ **Modern UI**: Clean, intuitive interface built with Material-UI

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 with TypeScript and React 18
- **UI Library**: Material-UI with custom theming
- **State Management**: React hooks and context
- **Map Integration**: Google Maps JavaScript API with react-google-maps
- **Data Visualization**: GeoJSON integration for transit line data

### Backend & Data
- **Database**: Supabase (PostgreSQL, Authentication, Real-time)
- **API Design**: RESTful Next.js API routes
- **Geospatial Data**: GeoJSON files for transit stations and rail lines
- **Location Services**: Google Places API for restaurant and place data
- **Authentication**: Supabase Auth with Row Level Security

### Data Integration
```typescript
// Transit station data from GeoJSON
const stationData = {
  type: "FeatureCollection",
  features: [/* station coordinates and properties */]
};

// Radius-based place search
const nearbyPlaces = await searchPlaces({
  center: stationCoordinates,
  radius: 800, // meters
  type: 'restaurant'
});
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   │   ├── restaurants/      # Restaurant search and favorites
│   │   │   ├── lists/            # Saved lists management
│   │   │   ├── transit/          # Transit station data
│   │   │   └── auth/             # Authentication
│   │   └── page.tsx              # Main application UI
│   ├── components/               # React components
│   │   ├── RestaurantCard.tsx    # Restaurant display component
│   │   ├── TripSelector.tsx      # Station selection interface
│   │   └── LandingPage.tsx       # Marketing landing page
│   ├── services/                 # Business logic
│   │   └── geminiService.ts      # Future AI integration
│   └── lib/                      # Utilities and configurations
├── public/data/                  # GeoJSON transit data
│   ├── skytrain-stations.geojson
│   └── rail-lines.geojson
└── docs/                         # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Google Maps API key
- Supabase account
- pnpm package manager

### Quick Start
```bash
# Install dependencies
cd frontend
pnpm install

# Configure environment variables
cp .env.example .env.local
# Add your API keys (GOOGLE_MAPS_API_KEY, SUPABASE_URL, etc.)

# Run development server
pnpm dev
```

Visit `http://localhost:3000` and start discovering places near transit stations!

## Innovation & Impact

This project demonstrates:
- **Location-Based Discovery**: Practical solution for transit users to find nearby places
- **Geospatial Integration**: Real-time mapping with transit data and place search
- **User-Centric Design**: Intuitive interface for organizing and managing favorite locations
- **Production-Ready**: Deployed, tested, and ready for real users

## Technologies

- **Frontend**: Next.js 14, React 18, TypeScript, Material-UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Maps & Location**: Google Maps API, Google Places API
- **Data**: GeoJSON for transit stations and rail lines
- **Package Manager**: pnpm
- **Deployment**: Vercel-ready with environment configuration

---

**SkyFinder** | Discover places near transit stations






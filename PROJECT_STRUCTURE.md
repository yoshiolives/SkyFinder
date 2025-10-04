# Places & AI Application - Project Structure

## Overview
This is a comprehensive full-stack application for discovering places with AI-powered recommendations using Snowflake, React, and Google Gemini AI.

## Project Structure

```
architecture-test/
├── README.md                          # Main project documentation
├── package.json                       # Root package.json with scripts
├── env.example                        # Environment variables template
├── PROJECT_STRUCTURE.md               # This file
│
├── frontend/                          # React TypeScript Frontend
│   ├── package.json                   # Frontend dependencies
│   ├── public/
│   │   └── index.html                 # HTML template
│   └── src/
│       ├── App.tsx                    # Main App component
│       ├── index.tsx                  # Entry point
│       ├── types/
│       │   └── index.ts               # TypeScript type definitions
│       ├── context/
│       │   ├── PlacesContext.tsx      # Places state management
│       │   └── AIContext.tsx          # AI state management
│       ├── services/
│       │   ├── placesService.ts       # Places API service
│       │   └── aiService.ts           # AI API service
│       ├── components/
│       │   └── Navbar.tsx             # Navigation component
│       └── pages/
│           ├── Home.tsx               # Home page
│           ├── Places.tsx             # Places listing page
│           ├── Recommendations.tsx    # AI recommendations page
│           └── About.tsx              # About page
│
├── backend/                           # Node.js/Express Backend
│   ├── package.json                     # Backend dependencies
│   └── src/
│       ├── index.ts                   # Main server file
│       ├── config/
│       │   ├── database.ts            # Snowflake configuration
│       │   └── gemini.ts              # Gemini AI configuration
│       ├── routes/
│       │   ├── places.ts              # Places API routes
│       │   ├── ai.ts                  # AI API routes
│       │   └── recommendations.ts    # Recommendations API routes
│       ├── middleware/
│       │   ├── errorHandler.ts        # Error handling middleware
│       │   ├── notFound.ts            # 404 handler
│       │   └── validation.ts          # Input validation
│       └── types/
│           └── Place.ts               # Backend type definitions
│
├── backend-flask/                     # Flask Python Backend (Alternative)
│   ├── requirements.txt               # Python dependencies
│   └── app.py                        # Flask application
│
├── database/                          # Database Configuration
│   ├── schemas/
│   │   ├── places.sql                # Places table schema
│   │   ├── users.sql                 # Users table schema
│   │   └── recommendations.sql       # Recommendations schema
│   └── migrate.js                    # Database migration script
│
├── docs/                             # Documentation
│   └── README.md                     # Detailed documentation
│
└── scripts/                          # Utility Scripts
    ├── setup.sh                      # Setup script
    └── start-dev.sh                  # Development startup script
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Leaflet** with React-Leaflet for maps
- **Axios** for HTTP requests
- **React Router** for navigation
- **React Context API** for state management

### Backend Options
#### Node.js/Express
- **Express.js** with TypeScript
- **Snowflake SDK** for database
- **Google Gemini AI** integration
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

#### Flask (Python)
- **Flask** web framework
- **Snowflake Connector** for database
- **Google Generative AI** integration
- **Flask-CORS** for cross-origin requests
- **Flask-RateLimiter** for rate limiting

### Database
- **Snowflake** data warehouse
- **Spatial queries** for location-based searches
- **JSON support** for flexible data storage
- **Time-series data** for analytics

### AI Integration
- **Google Gemini Pro** model
- **Personalized recommendations**
- **Chat interface** for user interaction
- **Content generation** for place descriptions

## Key Features

### 1. Place Discovery
- Browse and search places
- Filter by category, price, rating
- Interactive maps with location data
- Detailed place information

### 2. AI Recommendations
- Personalized suggestions based on preferences
- Confidence scoring for recommendations
- Chat interface with AI assistant
- User preference analysis

### 3. User Experience
- Responsive design for all devices
- Real-time search and filtering
- Interactive maps and navigation
- Modern Material-UI interface

### 4. Backend API
- RESTful API endpoints
- Rate limiting and security
- Error handling and validation
- Database connection management

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+ (for Flask option)
- Snowflake account
- Google Cloud account with Gemini API access

### Installation
1. Clone the repository
2. Run `npm run install:all` to install all dependencies
3. Copy `env.example` to `.env` and configure your settings
4. Set up Snowflake database and run migrations
5. Configure Gemini API key
6. Start the application with `npm run dev`

### Environment Variables
```bash
# Snowflake Configuration
SNOWFLAKE_ACCOUNT=your_account.region
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=PLACES_DB
SNOWFLAKE_SCHEMA=PUBLIC

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Places
- `GET /api/places` - Get all places
- `GET /api/places/:id` - Get place by ID
- `POST /api/places` - Create new place
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place
- `GET /api/places/search` - Search places
- `GET /api/places/nearby` - Get nearby places

### AI
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/suggestions` - Get AI suggestions
- `POST /api/ai/describe-place` - Generate place description
- `POST /api/ai/analyze-preferences` - Analyze user preferences

### Recommendations
- `GET /api/recommendations/:userId` - Get user recommendations
- `POST /api/recommendations/:userId/generate` - Generate new recommendations
- `POST /api/recommendations/:userId/interact` - Record user interaction
- `GET /api/recommendations/:userId/history` - Get interaction history

## Database Schema

### Places Table
- `id` (VARCHAR) - Primary key
- `name` (VARCHAR) - Place name
- `description` (TEXT) - Place description
- `latitude` (FLOAT) - Latitude coordinate
- `longitude` (FLOAT) - Longitude coordinate
- `category` (VARCHAR) - Place category
- `rating` (FLOAT) - Average rating
- `price_level` (INTEGER) - Price level (1-4)
- `photos` (ARRAY) - Photo URLs
- `address` (VARCHAR) - Full address
- `phone` (VARCHAR) - Phone number
- `website` (VARCHAR) - Website URL
- `opening_hours` (ARRAY) - Opening hours
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Users Table
- `id` (VARCHAR) - Primary key
- `name` (VARCHAR) - User name
- `email` (VARCHAR) - Email address
- `preferences` (VARIANT) - User preferences (JSON)
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Recommendations Table
- `id` (VARCHAR) - Primary key
- `place_id` (VARCHAR) - Foreign key to places
- `user_id` (VARCHAR) - Foreign key to users
- `reason` (TEXT) - Recommendation reason
- `confidence` (FLOAT) - Confidence score (0-1)
- `created_at` (TIMESTAMP) - Creation timestamp

### User Interactions Table
- `id` (VARCHAR) - Primary key
- `user_id` (VARCHAR) - Foreign key to users
- `place_id` (VARCHAR) - Foreign key to places
- `interaction_type` (VARCHAR) - Type of interaction
- `created_at` (TIMESTAMP) - Creation timestamp

## Development

### Scripts
- `npm run dev` - Start both frontend and backend
- `npm run frontend:dev` - Start frontend only
- `npm run backend:dev` - Start backend only
- `npm run build` - Build for production
- `npm run setup` - Initial setup

### Code Organization
- **Frontend**: Component-based architecture with React Context for state management
- **Backend**: RESTful API with middleware for security and validation
- **Database**: Snowflake with proper indexing and spatial queries
- **AI**: Google Gemini integration with prompt engineering

## Deployment

### Frontend
- Build with `npm run build`
- Deploy to Vercel, Netlify, or any static hosting

### Backend
- **Node.js**: Deploy to Heroku, AWS, Google Cloud
- **Flask**: Deploy to Heroku, AWS, Google Cloud with Gunicorn

### Database
- Configure Snowflake connection parameters
- Set up proper security and access controls
- Monitor usage and costs

## Security Considerations
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Secure environment variable management
- Database connection security
- API key protection

## Monitoring and Analytics
- Application health checks
- Database performance monitoring
- AI API usage tracking
- User interaction analytics
- Error logging and alerting

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
MIT License - see LICENSE file for details






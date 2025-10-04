# Places & AI Application Documentation

## Overview

This is a full-stack application for discovering and exploring places with AI-powered recommendations. The application uses Snowflake for data storage, React for the frontend, Node.js/Express or Flask for the backend API, and Google Gemini for AI functionality.

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **Maps**: Leaflet with React-Leaflet
- **HTTP Client**: Axios

### Backend Options

#### Option 1: Node.js/Express
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Snowflake SDK
- **AI**: Google Gemini API
- **Security**: Helmet, CORS, Rate Limiting

#### Option 2: Flask (Python)
- **Framework**: Flask
- **Database**: Snowflake Connector for Python
- **AI**: Google Generative AI
- **Security**: Flask-CORS, Flask-RateLimiter

### Database (Snowflake)
- **Data Warehouse**: Snowflake
- **Tables**: places, users, recommendations, user_interactions
- **Features**: Spatial queries, JSON support, time-series data

### AI Integration (Google Gemini)
- **Model**: Gemini Pro
- **Features**: Place descriptions, personalized recommendations, chat interface
- **Use Cases**: Content generation, user preference analysis

## Getting Started

### Prerequisites
- Node.js 18+ (for React frontend)
- Python 3.8+ (for Flask backend)
- Snowflake account
- Google Cloud account with Gemini API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd architecture-test
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies (Node.js)
   cd ../backend && npm install
   
   # OR install backend dependencies (Flask)
   cd ../backend-flask
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Set up Snowflake database**
   ```bash
   cd database
   node migrate.js
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run frontend:dev
   npm run backend:dev
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
```sql
CREATE TABLE places (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    category VARCHAR(100),
    rating FLOAT,
    price_level INTEGER,
    photos ARRAY,
    address VARCHAR(500),
    phone VARCHAR(50),
    website VARCHAR(500),
    opening_hours ARRAY,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    preferences VARIANT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

### Recommendations Table
```sql
CREATE TABLE recommendations (
    id VARCHAR(36) PRIMARY KEY,
    place_id VARCHAR(36) REFERENCES places(id),
    user_id VARCHAR(36) REFERENCES users(id),
    reason TEXT,
    confidence FLOAT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

## AI Features

### Place Description Generation
- Automatically generates compelling descriptions for places
- Uses place name, category, and location data
- Creates engaging content that encourages visits

### Personalized Recommendations
- Analyzes user preferences and interaction history
- Provides AI-powered place suggestions
- Includes confidence scores and personalized notes

### Chat Interface
- Conversational AI for place recommendations
- Context-aware responses
- Maintains conversation history

### User Preference Analysis
- Analyzes user interaction patterns
- Identifies preferred categories, price ranges, and locations
- Continuously improves recommendation accuracy

## Deployment

### Frontend (React)
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or any static hosting

### Backend (Node.js/Express)
- Build: `npm run build`
- Deploy to: Heroku, AWS, Google Cloud, or any Node.js hosting

### Backend (Flask)
- Deploy to: Heroku, AWS, Google Cloud, or any Python hosting
- Use Gunicorn for production: `gunicorn app:app`

### Database (Snowflake)
- Configure connection parameters
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






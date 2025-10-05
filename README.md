# Places.ai - AI-Powered Travel Itinerary Planner

> **Hackathon Project**: Leveraging Google Gemini AI to revolutionize trip planning

## The Problem

Planning a trip is **overwhelming and time-consuming**:
- Researching destinations, activities, and restaurants takes hours
- Coordinating schedules, locations, and timing is tedious
- Balancing different preferences and constraints is difficult
- Manually organizing everything into a coherent itinerary is frustrating

**Result**: People either spend days planning trips or end up with disorganized, suboptimal itineraries that don't maximize their vacation time.

## Our Solution

**Places.ai** is an intelligent travel planning platform that uses **Google Gemini AI** to instantly generate complete, personalized trip itineraries. Just tell us where you're going and your preferences—our AI handles the rest.

### How Gemini Powers Our Platform

1. **Intelligent Itinerary Generation**: Gemini analyzes your destination, dates, and preferences to create complete day-by-day itineraries including hotels, meals, activities, and optimal scheduling

2. **Conversational AI Assistant**: A Gemini-powered chatbot helps you modify your trip in natural language—add activities, change times, get recommendations, all through conversation

3. **Context-Aware Planning**: Gemini understands travel context—timing constraints, geographic proximity, activity types, and user preferences—to create realistic, enjoyable itineraries

4. **Personalization at Scale**: Each itinerary is uniquely tailored using Gemini's advanced language understanding to match your specific travel style and interests

## Value Proposition

### For Travelers
- **Save Hours**: What takes hours of research is done in 90 seconds
- **Better Trips**: AI-optimized scheduling maximizes your vacation time
- **Stress-Free Planning**: No more decision fatigue or coordination headaches
- **Flexibility**: Easily modify and refine your itinerary with the AI assistant

### Key Features
- 🤖 **AI Trip Generation**: Complete itineraries in under 2 minutes using Gemini
- 🗺️ **Interactive Map**: Visualize your entire trip with Google Maps integration
- 💬 **Smart Chatbot**: Modify your trip naturally using conversational AI
- 📱 **Drag & Drop**: Intuitive interface to reorganize activities between days
- 🔐 **Personal Trips**: Secure authentication and cloud storage for all your trips
- ✨ **Beautiful UI**: Modern, responsive design inspired by iOS/macOS

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 with TypeScript and React 18
- **UI Library**: Material-UI with custom theming
- **State Management**: React hooks and context
- **Map Integration**: Google Maps JavaScript API with react-google-maps
- **Drag & Drop**: react-beautiful-dnd for intuitive reorganization

### Backend & AI
- **AI Engine**: Google Gemini 2.5 Flash for generation and conversation
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **API Design**: RESTful Next.js API routes
- **Prompt Engineering**: Custom templates for consistent, high-quality itineraries

### Gemini Integration Details
```typescript
// Intelligent prompt engineering for optimal results
const prompt = generateItineraryPrompt({
  destination,
  startDate, 
  endDate,
  description: userPreferences
});

// Gemini generates structured JSON itineraries
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
});
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   │   ├── trips/generate/   # AI itinerary generation endpoint
│   │   │   ├── chat/             # Gemini chatbot endpoint
│   │   │   ├── itinerary/        # Itinerary CRUD
│   │   │   └── auth/             # Authentication
│   │   └── page.tsx              # Main application UI (1855 lines)
│   ├── components/               # React components
│   │   ├── ChatBot.tsx           # Gemini-powered chat assistant
│   │   ├── TripSelector.tsx      # Trip management with AI generation
│   │   └── LandingPage.tsx       # Marketing landing page
│   ├── services/                 # Business logic
│   │   ├── geminiService.ts      # Gemini API integration
│   │   └── templates/            # AI prompt templates
│   └── lib/                      # Utilities and configurations
└── docs/                         # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key
- Google Maps API key
- Supabase account

### Quick Start
```bash
# Install dependencies
cd architecture-test/frontend
npm install

# Configure environment variables
cp .env.example .env.local
# Add your API keys (GEMINI_API_KEY, GOOGLE_MAPS_API_KEY, SUPABASE_URL, etc.)

# Run development server
npm run dev
```

Visit `http://localhost:3000` and start planning your next adventure!

## Innovation & Impact

This project demonstrates:
- **Practical AI Application**: Real-world solution to a genuine problem using Gemini
- **Superior UX**: Complex AI interactions made simple and intuitive
- **Full-Stack Integration**: Seamless coordination between AI, backend, and frontend
- **Production-Ready**: Deployed, tested, and ready for real users

## Technologies

- **AI/ML**: Google Gemini 2.5 Flash
- **Frontend**: Next.js, React, TypeScript, Material-UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **APIs**: Google Maps, Google Places
- **Deployment**: Vercel-ready with environment configuration

---

**Built for StormHacks 2025** | Powered by Google Gemini AI






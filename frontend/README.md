# Places AI Frontend - Next.js

This is a [Next.js](https://nextjs.org/) project for AI-powered travel itinerary planning with interactive maps.

## Getting Started

### 1. Install Dependencies

This project uses `pnpm` for package management.

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API keys:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

Following Next.js best practices with all application code in `src/`:

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory (routing)
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── trips/         # Trip management endpoints
│   │   │   └── itinerary/     # Itinerary endpoints
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ChatBot.tsx        # AI chatbot component
│   │   ├── LoginModal.tsx     # Login/signup modal
│   │   └── TripSelector.tsx   # Trip selection component
│   ├── lib/                   # Library utilities
│   │   ├── supabase.ts        # Supabase client
│   │   ├── supabase-server.ts # Supabase server utilities
│   │   └── api.ts             # Authenticated API client
│   └── services/              # Service layer
│       └── geminiService.ts   # Gemini AI service
├── docs/                      # Documentation
├── public/                    # Static files
├── .env.local                # Environment variables (gitignored)
├── biome.json                # Biome configuration
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Features

- 🗺️ **Interactive Google Maps** - View your itinerary locations on an interactive map
- 🤖 **AI Chat Assistant** - Get travel recommendations powered by Gemini AI
- 📅 **Itinerary Management** - Add, remove, and modify activities
- 🔐 **Authentication** - User login/signup with Supabase
- 💾 **Database Storage** - Store trips and itineraries in Supabase
- 🎨 **Modern UI** - Built with Material-UI for a beautiful, responsive design
- 🚀 **Next.js** - Server-side rendering and optimal performance
- ⚡ **Fast Linting** - Biome for ultra-fast code linting and formatting

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material-UI** - UI component library
- **Google Maps API** - Interactive maps
- **Gemini AI** - AI-powered travel assistant
- **Supabase** - Authentication and database
- **Biome** - Fast linter and formatter
- **Axios** - HTTP client

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linter
- `pnpm biome:check` - Check code with Biome
- `pnpm biome:fix` - Fix issues with Biome
- `pnpm format` - Format code with Biome

## Converting to Production

When ready to add real AI capabilities:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file
3. The service layer is already set up and ready to integrate the real API

## Documentation

Detailed documentation is available in the `docs/` directory:

- 📖 **[Supabase Setup](docs/SUPABASE_SETUP.md)** - Authentication and database setup
- 📖 **[Data Flow](docs/DATA_FLOW.md)** - How data flows through the application
- 📖 **[Biome Setup](docs/BIOME_SETUP.md)** - Linter and formatter configuration
- 📖 **[Git Hooks Setup](docs/GIT_HOOKS_SETUP.md)** - Pre-commit hooks configuration

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Google Maps API](https://developers.google.com/maps)
- [Gemini API Documentation](https://ai.google.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Biome Documentation](https://biomejs.dev/)


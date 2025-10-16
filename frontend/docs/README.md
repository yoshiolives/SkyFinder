# SkyFinder - Restaurant Finder Near Transit Stations

Hey! This is my first real web app project. I built this because I was tired of wandering around transit stations looking for good places to eat. Now you can find restaurants within walking distance of any SkyTrain station in Vancouver!

## What This App Does

- **Find Restaurants**: Search for places to eat near any transit station
- **See on Map**: View all the restaurants on an interactive Google Map
- **Save Favorites**: Create lists of your favorite spots
- **Real-time Search**: Uses Google Places API to find current restaurant info

## How I Built It

This is a Next.js app (which I'm still learning!) that uses:
- **Frontend**: React with Material-UI for the interface
- **Backend**: Next.js API routes (this was new to me!)
- **Database**: Supabase (PostgreSQL) to store user data
- **Maps**: Google Maps API to show restaurants and stations
- **Authentication**: Supabase handles user login/signup

## Project Structure

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── layout.tsx         # Main app layout
│   └── page.tsx           # Home page with map and search
├── components/            # React components I built
│   ├── LandingPage.tsx    # Marketing page
│   ├── LoginModal.tsx     # User login/signup
│   ├── RestaurantCard.tsx # Shows restaurant info
│   └── TripSelector.tsx   # Station selection
├── lib/                   # Helper functions
│   ├── api.ts            # API client for authenticated requests
│   ├── supabase.ts       # Database connection
│   └── utils.ts          # Utility functions
└── services/             # Business logic (mostly empty now)
```

## Getting Started

1. **Clone the repo** (if you want to run it yourself)
2. **Install dependencies**: `pnpm install`
3. **Set up environment variables** (see DATABASE_SETUP.md)
4. **Run the app**: `pnpm dev`

## What I Learned

- How to use Next.js App Router (it's different from Pages Router!)
- Building API routes in Next.js
- Working with Supabase (database + auth)
- Google Maps integration
- Material-UI components
- TypeScript (still learning this one!)

## Things I Want to Improve

- Better error handling (I'm not great at this yet)
- More restaurant filters (price, cuisine type, etc.)
- Mobile responsiveness (needs work)
- Performance optimization (the map can be slow sometimes)

## Note for Other CS Students

This was my first time building a full-stack app, so the code might not be perfect. I'm still learning about best practices, but I tried to make it readable and well-commented. Feel free to ask questions or suggest improvements!

## Contact

If you have questions about how I built this or want to collaborate, feel free to reach out!

---

*Built with ❤️ by a CS student who just wanted to find good food near transit stations*
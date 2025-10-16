# SkyFinder - Restaurant Finder Near Transit Stations

Hey! This is my first real web app project. I built SkyFinder because I was tired of wandering around transit stations looking for good places to eat. Now you can find restaurants within walking distance of any SkyTrain station in Vancouver!

## What This App Does

- **Find Restaurants**: Search for places to eat near any transit station
- **See on Map**: View all the restaurants on an interactive Google Map  
- **Save Favorites**: Create lists of your favorite spots
- **Real-time Search**: Uses Google Places API to find current restaurant info

## The Problem I Was Trying to Solve

When I was commuting on the SkyTrain, I'd always wonder "what's good to eat near this station?" But I'd end up:
- Walking around aimlessly looking for restaurants
- Missing out on great spots because I didn't know they existed
- Forgetting about places I discovered
- Wasting time searching for food during my commute

So I built this app to solve that problem!

## How It Works

1. **Select Transit Stations**: Click on any station on the map
2. **See Coverage Area**: A circle shows the 800m walking radius
3. **Find Restaurants**: The app searches for places within that radius
4. **Save Your Favorites**: Create lists to organize places you want to try

## What I Built This With

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Material-UI (I'm still learning CSS, so this helps!)
- **Database**: Supabase (PostgreSQL with built-in authentication)
- **Maps**: Google Maps API for showing restaurants and stations
- **Location Data**: Google Places API for restaurant information

## Getting Started

1. **Clone this repo** (if you want to run it yourself)
2. **Install dependencies**: `cd frontend && pnpm install`
3. **Set up environment variables** (see the docs in `frontend/docs/`)
4. **Run the app**: `pnpm dev`

Visit `http://localhost:3000` and start finding restaurants near transit stations!

## Project Structure

```
SkyFinder/
├── frontend/              # The main Next.js app
│   ├── src/
│   │   ├── app/          # Pages and API routes
│   │   ├── components/   # React components I built
│   │   └── lib/         # Helper functions
│   ├── docs/            # Documentation (beginner-friendly!)
│   └── public/          # Static files and GeoJSON data
└── README.md            # This file
```

## What I Learned Building This

- How to use Next.js App Router (it's different from Pages Router!)
- Building API routes in Next.js
- Working with Supabase (database + auth)
- Google Maps integration with React
- Material-UI components
- TypeScript (still learning this one!)
- Database design and relationships
- Authentication and security

## Things I Want to Improve

- Better error handling (I'm not great at this yet)
- More restaurant filters (price, cuisine type, etc.)
- Mobile responsiveness (needs work)
- Performance optimization (the map can be slow sometimes)
- Add user reviews and ratings
- Better search functionality

## For Other CS Students

This was my first time building a full-stack app, so the code might not be perfect. I'm still learning about best practices, but I tried to make it readable and well-commented. 

The documentation in `frontend/docs/` explains how I built everything, including the mistakes I made and things I learned along the way.

Feel free to:
- Ask questions about how I built this
- Suggest improvements
- Use this as a reference for your own projects
- Point out things I could do better (I'm still learning!)

## Contact

If you have questions about how I built this or want to collaborate, feel free to reach out!

## License

This project is open source and available under the MIT License.

---

*Built with ❤️ by a CS student who just wanted to find good food near transit stations*

*P.S. - If you're in Vancouver, try the sushi near Commercial-Broadway station! 🍣*
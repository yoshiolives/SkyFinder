# Restaurant Feature Setup Checklist

Follow these steps to get the restaurant finder feature working.

## ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Supabase account and project created
- [ ] Google Maps API key with Places API enabled
- [ ] pnpm installed (`npm install -g pnpm`)

---

## 📋 Setup Steps

### 1. Environment Variables

Create/update `.env.local` in the `frontend/` directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_API_KEY=your_supabase_anon_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Site URL (for auth callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Required APIs to enable in Google Cloud Console:**
- ✅ Places API
- ✅ Maps JavaScript API
- ✅ Geocoding API

---

### 2. Database Setup

Run the SQL from `docs/DATABASE_SETUP.md` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each section from `docs/DATABASE_SETUP.md` in order:
   - Enable PostGIS extension
   - Create tables
   - Create indexes
   - Create spatial index
   - Create spatial search function
   - Create update timestamp function
   - Enable RLS policies

**Quick SQL Setup:**
```bash
# Open Supabase SQL Editor and run:
# 1. docs/DATABASE_SETUP.md - Step 1 (PostGIS)
# 2. docs/DATABASE_SETUP.md - Step 2 (Tables)
# 3. docs/DATABASE_SETUP.md - Step 3 (Indexes)
# 4. docs/DATABASE_SETUP.md - Step 4 (Spatial Index)
# 5. docs/DATABASE_SETUP.md - Step 5 (Spatial Function)
# 6. docs/DATABASE_SETUP.md - Step 6 (Update Function)
# 7. docs/DATABASE_SETUP.md - Step 7 (RLS Policies)
```

---

### 3. Install Dependencies

```bash
cd frontend
pnpm install
```

---

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

---

## 🧪 Testing the APIs

### Test 1: Fetch Restaurants from Google Places

```bash
curl -X POST http://localhost:3000/api/restaurants/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 5000
  }'
```

**Expected:** JSON response with fetched restaurants

---

### Test 2: Search Restaurants

```bash
curl "http://localhost:3000/api/restaurants/search?latitude=37.7749&longitude=-122.4194&minRating=4.0"
```

**Expected:** JSON response with restaurants from database

---

### Test 3: Add to Favorites (requires auth)

```bash
# First, login to get session
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Then add to favorites (use restaurant_id from previous responses)
curl -X POST http://localhost:3000/api/restaurants/favorites \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your_token" \
  -d '{
    "restaurant_id": "uuid-here"
  }'
```

---

## 🐛 Troubleshooting

### "Google Maps API key not configured"
- Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Restart dev server after adding env vars
- Verify API key has Places API enabled

### "PostGIS function does not exist"
- Run Step 1 and Step 5 from `docs/DATABASE_SETUP.md`
- Verify PostGIS extension is enabled in Supabase

### "Table does not exist"
- Run Step 2 from `docs/DATABASE_SETUP.md`
- Check Supabase dashboard → Table Editor

### "RLS policy violation"
- Run Step 7 from `docs/DATABASE_SETUP.md`
- Verify you're authenticated (check session)

### "Unauthorized" errors
- Make sure you're logged in
- Check session cookies are being sent
- Verify JWT token is valid

---

## 📁 Files Created/Updated

### New Files:
- ✅ `src/app/api/restaurants/search/route.ts` - Search API
- ✅ `src/app/api/restaurants/fetch/route.ts` - Fetch from Google Places
- ✅ `src/app/api/restaurants/favorites/route.ts` - Favorites API
- ✅ `src/components/RestaurantCard.tsx` - Restaurant card component
- ✅ `docs/RESTAURANT_SCHEMA.md` - Database schema docs
- ✅ `docs/DATABASE_SETUP.md` - Database setup guide
- ✅ `docs/API_ENDPOINTS.md` - API documentation

### Updated Files:
- ✅ `src/lib/supabase-server.ts` - Server-side Supabase client
- ✅ `src/app/api/restaurants/*` - Fixed import issues

---

## 🎯 Next Steps

After setup is complete:

1. **Test the UI** - Use the restaurant search in the app
2. **Add More Features** - Implement search filters, sorting, pagination
3. **Deploy** - Deploy to Vercel/Netlify
4. **Monitor** - Check Supabase logs and Google Maps API usage

---

## 📚 Documentation

- [Database Setup Guide](./docs/DATABASE_SETUP.md)
- [API Endpoints](./docs/API_ENDPOINTS.md)
- [Restaurant Schema](./docs/RESTAURANT_SCHEMA.md)
- [Project Guidelines](./docs/README.md)

---

## ✅ Completion Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] PostGIS extension enabled
- [ ] Spatial search function created
- [ ] RLS policies configured
- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Fetch API tested
- [ ] Search API tested
- [ ] Favorites API tested
- [ ] UI components working

---

**Need Help?** Check the troubleshooting section or review the documentation files.


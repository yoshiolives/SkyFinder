import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  price_level?: number;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, latitude, longitude, radius = 5000, keyword } = body;

    // Validate parameters
    if (!location && (!latitude || !longitude)) {
      return NextResponse.json(
        { error: 'Location or coordinates required' },
        { status: 400 }
      );
    }

    // Build Google Places API request
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    let googlePlacesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
    
    if (latitude && longitude) {
      googlePlacesUrl += `location=${latitude},${longitude}`;
    } else {
      // Geocode the location first
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleMapsApiKey}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location;
        googlePlacesUrl += `location=${location.lat},${location.lng}`;
      } else {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }
    }

    googlePlacesUrl += `&radius=${radius}`;
    googlePlacesUrl += `&type=restaurant`;
    if (keyword) {
      googlePlacesUrl += `&keyword=${encodeURIComponent(keyword)}`;
    }
    googlePlacesUrl += `&key=${googleMapsApiKey}`;

    // Fetch from Google Places API
    const response = await fetch(googlePlacesUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data);
      return NextResponse.json(
        { error: 'Failed to fetch restaurants from Google Places' },
        { status: 500 }
      );
    }

    const places: GooglePlacesResult[] = data.results || [];

    // Save to database
    const supabase = createServerSupabaseClient();
    const restaurants = [];

    for (const place of places) {
      // Extract cuisine types from place types
      const cuisineTypes = place.types
        ?.filter((type) => 
          type.includes('restaurant') || 
          type.includes('food') || 
          type.includes('cafe') ||
          type.includes('bar')
        )
        .map((type) => type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()))
        .slice(0, 3) || [];

      // Extract photo references
      const photos = place.photos?.map((photo) => photo.photo_reference) || [];

      const restaurantData = {
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        price_level: place.price_level || null,
        rating: place.rating || null,
        user_ratings_total: place.user_ratings_total || 0,
        cuisine_types: cuisineTypes,
        opening_hours: place.opening_hours || null,
        is_open_now: place.opening_hours?.open_now || false,
        photos: photos,
      };

      // Insert or update restaurant
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .upsert(restaurantData, {
          onConflict: 'place_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving restaurant:', error);
      } else {
        restaurants.push(restaurant);
      }
    }

    return NextResponse.json({
      restaurants,
      count: restaurants.length,
      fetched: places.length,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


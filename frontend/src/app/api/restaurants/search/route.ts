import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface SearchParams {
  location?: string;
  latitude?: string;
  longitude?: string;
  cuisine?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  openNow?: string;
  radius?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract search parameters
    const params: SearchParams = {
      location: searchParams.get('location') || undefined,
      latitude: searchParams.get('latitude') || undefined,
      longitude: searchParams.get('longitude') || undefined,
      cuisine: searchParams.get('cuisine') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      openNow: searchParams.get('openNow') || undefined,
      radius: searchParams.get('radius') || '5000', // Default 5km
    };

    // Validate required parameters
    if (!params.location && (!params.latitude || !params.longitude)) {
      return NextResponse.json({ error: 'Location or coordinates required' }, { status: 400 });
    }

    // Get user authentication
    const supabase = createServerSupabaseClient();

    // Build query
    let query = supabase.from('restaurants').select('*');

    // Apply filters
    if (params.cuisine) {
      query = query.contains('cuisine_types', [params.cuisine]);
    }

    if (params.minPrice) {
      query = query.gte('price_level', parseInt(params.minPrice, 10));
    }

    if (params.maxPrice) {
      query = query.lte('price_level', parseInt(params.maxPrice, 10));
    }

    if (params.minRating) {
      query = query.gte('rating', parseFloat(params.minRating));
    }

    if (params.openNow === 'true') {
      query = query.eq('is_open_now', true);
    }

    // If coordinates provided, use spatial query
    if (params.latitude && params.longitude) {
      const lat = parseFloat(params.latitude);
      const lng = parseFloat(params.longitude);
      const radius = parseInt(params.radius || '5000', 10); // in meters

      // Use PostGIS for spatial search
      // Note: This requires the PostGIS extension and function in Supabase
      const { data: nearbyData, error: nearbyError } = await supabase.rpc(
        'search_nearby_restaurants',
        {
          lat,
          lng,
          radius_meters: radius,
        }
      );

      if (!nearbyError && nearbyData) {
        // If we have nearby data, return it directly
        return NextResponse.json({
          restaurants: nearbyData,
          count: nearbyData.length,
        });
      }
      // If RPC fails, fall through to regular query with lat/lng filter
    }

    // Order by rating
    query = query.order('rating', { ascending: false });

    // Limit results
    query = query.limit(50);

    const { data: restaurants, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to search restaurants' }, { status: 500 });
    }

    // If no results in database, return empty array
    // In production, you might want to fetch from Google Places API here
    return NextResponse.json({
      restaurants: restaurants || [],
      count: restaurants?.length || 0,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

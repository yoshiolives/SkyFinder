import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/restaurants/favorites - Get user's favorite restaurants
export async function GET(_request: NextRequest) {
  try {
    const { session } = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Get user's favorite restaurants
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        restaurant_id,
        created_at,
        restaurants (*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    return NextResponse.json({
      favorites: favorites || [],
      count: favorites?.length || 0,
    });
  } catch (error) {
    console.error('Favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/restaurants/favorites - Add restaurant to favorites
export async function POST(request: NextRequest) {
  try {
    const { session } = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { restaurant_id } = body;

    if (!restaurant_id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Check if restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Add to favorites
    const { data: favorite, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: session.user.id,
        restaurant_id: restaurant_id,
      })
      .select(`
        id,
        restaurant_id,
        created_at,
        restaurants (*)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);

      // Check if it's a duplicate
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Restaurant already in favorites' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 });
    }

    return NextResponse.json(
      {
        favorite,
        message: 'Restaurant added to favorites',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/restaurants/favorites - Remove restaurant from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { session } = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurant_id = searchParams.get('restaurant_id');

    if (!restaurant_id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Remove from favorites
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('restaurant_id', restaurant_id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Restaurant removed from favorites',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

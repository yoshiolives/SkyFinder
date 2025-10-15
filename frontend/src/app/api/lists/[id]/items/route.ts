import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/lists/[id]/items - Get all items in a list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerSupabaseClient(token);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns the list
    const { data: list, error: listError } = await supabase
      .from('saved_lists')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    // Get items in the list
    const { data: items, error } = await supabase
      .from('saved_list_items')
      .select('*')
      .eq('list_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching list items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch list items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error('Get list items API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/lists/[id]/items - Add an item to a list
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerSupabaseClient(token);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns the list
    const { data: list, error: listError } = await supabase
      .from('saved_lists')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      place_id,
      name,
      address,
      latitude,
      longitude,
      rating,
      user_ratings_total,
      price_level,
      types,
      photos,
      notes,
    } = body;

    // Validate required fields
    if (!place_id || !name) {
      return NextResponse.json(
        { error: 'Place ID and name are required' },
        { status: 400 }
      );
    }

    // Add item to list
    const { data: item, error } = await supabase
      .from('saved_list_items')
      .insert({
        list_id: params.id,
        place_id,
        name,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        rating: rating || null,
        user_ratings_total: user_ratings_total || 0,
        price_level: price_level || null,
        types: types || [],
        photos: photos || [],
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item to list:', error);
      
      // Check if item already exists in list
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This place is already in the list' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to add item to list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Add list item API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


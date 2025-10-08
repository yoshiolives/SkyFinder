import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

// DELETE an itinerary item
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || '';

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = params.id;

    // First, verify the item belongs to a trip owned by the user
    const { data: item } = await supabase
      .from('itinerary_items')
      .select('trip_id')
      .eq('id', itemId)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Verify the trip belongs to the user
    const { data: trip } = await supabase
      .from('trips')
      .select('id')
      .eq('id', item.trip_id)
      .eq('user_id', user.id)
      .single();

    if (!trip) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the item
    const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update an itinerary item
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || '';

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = params.id;
    const body = await request.json();

    // First, verify the item belongs to a trip owned by the user
    const { data: item } = await supabase
      .from('itinerary_items')
      .select('trip_id')
      .eq('id', itemId)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Verify the trip belongs to the user
    const { data: trip } = await supabase
      .from('trips')
      .select('id')
      .eq('id', item.trip_id)
      .eq('user_id', user.id)
      .single();

    if (!trip) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the item
    const updateData: any = {};
    if (body.date) updateData.date = body.date;
    if (body.time) updateData.time = body.time;
    if (body.location) updateData.location = body.location;
    if (body.address) updateData.address = body.address;
    if (body.activity) updateData.activity = body.activity;
    if (body.duration) updateData.duration = body.duration;
    if (body.type) updateData.type = body.type;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.coordinates) {
      updateData.latitude = body.coordinates[0];
      updateData.longitude = body.coordinates[1];
    }
    if (body.notes) updateData.notes = body.notes;

    const { data: updatedItem, error } = await supabase
      .from('itinerary_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

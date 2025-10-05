import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

// GET all trips for the current user
export async function GET(request: NextRequest) {
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

    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trips }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new trip
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, description, destination, start_date, end_date } = body;

    if (!title || !destination || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .insert([
        {
          user_id: user.id,
          title,
          description,
          destination,
          start_date,
          end_date,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

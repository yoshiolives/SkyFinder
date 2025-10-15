import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/lists - Get all lists for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get auth token from headers
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

    // Get lists with item counts
    const { data: lists, error } = await supabase.rpc('get_lists_with_counts', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error fetching lists:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lists' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lists: lists || [] });
  } catch (error) {
    console.error('Lists API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/lists - Create a new list
export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
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

    const body = await request.json();
    const { name, description, icon, color } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'List name is required' },
        { status: 400 }
      );
    }

    // Create the list
    const { data: list, error } = await supabase
      .from('saved_lists')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || '📌',
        color: color || '#4285F4',
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating list:', error);
      
      // Check if it's a duplicate name error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A list with this name already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    console.error('Create list API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


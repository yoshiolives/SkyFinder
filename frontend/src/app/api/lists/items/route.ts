import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/lists/items - Get all items from all lists for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerSupabaseClient(token);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all lists owned by the user
    const { data: lists, error: listsError } = await supabase
      .from('saved_lists')
      .select('id')
      .eq('user_id', user.id);

    if (listsError) {
      console.error('Error fetching lists:', listsError);
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
    }

    if (!lists || lists.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Get all items from all lists
    const listIds = lists.map((list) => list.id);
    const { data: items, error: itemsError } = await supabase
      .from('saved_list_items')
      .select('*')
      .in('list_id', listIds)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('Error fetching list items:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch list items' }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error('Get all list items API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// DELETE /api/lists/[id]/items/[itemId] - Remove an item from a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    
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

    // Delete the item
    const { error } = await supabase
      .from('saved_list_items')
      .delete()
      .eq('id', params.itemId)
      .eq('list_id', params.id);

    if (error) {
      console.error('Error deleting list item:', error);
      return NextResponse.json(
        { error: 'Failed to delete list item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete list item API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(_request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

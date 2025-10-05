import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

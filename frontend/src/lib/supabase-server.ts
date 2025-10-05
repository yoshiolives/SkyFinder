import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || '';

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function getServerSession() {
  const supabase = createServerSupabaseClient();

  try {
    const cookieStore = cookies();

    // Get access token from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return { session: null, error: 'No session found' };
    }

    // Set the session using the tokens from cookies
    const {
      data: { session },
      error,
    } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return { session: null, error: error.message };
    }

    return { session, error: null };
  } catch (_error) {
    return { session: null, error: 'Failed to get session' };
  }
}

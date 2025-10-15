import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createServerSupabaseClient(token?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || '';

  const options: any = {
    auth: {
      detectSessionInUrl: false,
      persistSession: false,
    },
  };

  // If token is provided, add it to the headers
  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
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

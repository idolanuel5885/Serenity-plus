import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if environment variables are available
const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to get Supabase client with error handling
export function getSupabase() {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured. Environment variables missing.');
  }
  return supabaseClient;
}

// Export the client for backward compatibility (but it can be null)
// @ts-ignore - Temporarily ignore null checks for backward compatibility
export const supabase = supabaseClient;

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supports both the new publishable key (sb_publishable_…) and the legacy anon key.
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

if (!url || !publishableKey) {
  // Surfaced clearly in the console during local dev if env vars are missing.
  // The app still loads; auth-dependent screens will show an error.
  console.warn(
    '[Crystal Touch] Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — copy .env.example to .env',
  );
}

export const supabase = createClient(url ?? 'http://localhost', publishableKey ?? 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

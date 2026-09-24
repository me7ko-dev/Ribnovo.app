import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Връзка към Supabase за четене на публичните данни.
// Ако ключовете още не са попълнени (.env.local или Vercel), връща null
// и приложението показва примерни данни.
export function getPublicSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

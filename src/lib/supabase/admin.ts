import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "../env";

// Връзка с пълни права — САМО на сървъра (известия, имейли в админ панела).
// Ключът SUPABASE_SECRET_KEY никога не се показва в браузъра.
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !secret) return null;
  return createClient(SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

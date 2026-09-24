import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "../env";

// Връзка към Supabase от браузъра (за качване на снимки)
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}

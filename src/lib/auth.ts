import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { hasSupabase } from "./env";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

export type Me = {
  id: string;
  email: string | null;
  phone: string | null;
  profile: Profile;
};

// Кой е влязъл (или null). Кешира се за една заявка.
export const getMe = cache(async (): Promise<Me | null> => {
  await connection(); // винаги при заявка, не при изграждане
  if (!hasSupabase) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, organization, role, avatar_url")
    .eq("id", user.id)
    .single();
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    profile: (profile as Profile | null) ?? {
      id: user.id,
      full_name: null,
      organization: null,
      role: "resident",
      avatar_url: null,
    },
  };
});

// За страници, които изискват вход
export async function requireMe(next: string) {
  const me = await getMe();
  if (!me) redirect(`/vhod?next=${encodeURIComponent(next)}`);
  return me;
}

export function isVerified(me: Me | null) {
  return me?.profile.role === "verified" || me?.profile.role === "admin";
}

export function isAdmin(me: Me | null) {
  return me?.profile.role === "admin";
}

export { displayName } from "./names";

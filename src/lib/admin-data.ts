import { connection } from "next/server";
import { EVENT_FIELDS, POST_FIELDS } from "./data";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import type { Post, Profile, VillageEvent } from "./types";

// Данни за админ панела (правата се проверяват и в базата чрез RLS)

export async function getPending() {
  await connection();
  const supabase = await createClient();
  const [posts, events] = await Promise.all([
    supabase.from("posts").select(POST_FIELDS).eq("status", "pending").order("created_at"),
    supabase.from("events").select(EVENT_FIELDS).eq("status", "pending").order("created_at"),
  ]);
  return {
    posts: (posts.data ?? []) as unknown as Post[],
    events: (events.data ?? []) as unknown as VillageEvent[],
  };
}

export type ReportItem = {
  id: string;
  target_type: "post" | "event" | "alert" | "comment";
  target_id: string;
  reason: string;
  created_at: string;
  reporter: Pick<Profile, "full_name" | "organization"> | null;
  preview: string;
  href: string | null;
};

export async function getOpenReports(): Promise<ReportItem[]> {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("id, target_type, target_id, reason, created_at, reporter:profiles!reports_reporter_id_fkey(full_name, organization)")
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .limit(100);
  const reports = (data ?? []) as unknown as Omit<ReportItem, "preview" | "href">[];

  const ids = (type: string) => reports.filter((r) => r.target_type === type).map((r) => r.target_id);
  const [posts, events, alerts, comments] = await Promise.all([
    supabase.from("posts").select("id, title").in("id", ids("post")),
    supabase.from("events").select("id, title").in("id", ids("event")),
    supabase.from("alerts").select("id, title").in("id", ids("alert")),
    supabase.from("comments").select("id, body, post_id").in("id", ids("comment")),
  ]);
  const titles = new Map<string, { preview: string; href: string | null }>();
  posts.data?.forEach((p) => titles.set(p.id, { preview: p.title, href: `/novini/${p.id}` }));
  events.data?.forEach((e) => titles.set(e.id, { preview: e.title, href: `/sabitiya/${e.id}` }));
  alerts.data?.forEach((a) => titles.set(a.id, { preview: a.title, href: "/alarmi" }));
  comments.data?.forEach((c) => titles.set(c.id, { preview: `„${c.body}“`, href: `/novini/${c.post_id}#komentari` }));

  return reports.map((r) => ({ ...r, ...(titles.get(r.target_id) ?? { preview: "(вече изтрито)", href: null }) }));
}

export type Person = Profile & { contact: string | null; created_at: string };

export async function getPeople(search: string): Promise<Person[]> {
  await connection();
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, organization, role, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const q = search.replace(/[%,()]/g, "").trim();
  if (q) query = query.or(`full_name.ilike.%${q}%,organization.ilike.%${q}%`);
  const { data } = await query;
  const people = (data ?? []) as (Profile & { created_at: string })[];

  // Имейл/телефон — само ако на сървъра има таен ключ
  const contacts = new Map<string, string>();
  const admin = createAdminClient();
  if (admin) {
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    users?.users.forEach((u) => contacts.set(u.id, u.email || u.phone || ""));
  }
  const sorted = people.map((p) => ({ ...p, contact: contacts.get(p.id) || null }));
  const rank = { admin: 0, verified: 1, resident: 2 };
  return sorted.sort((a, b) => rank[a.role] - rank[b.role]);
}

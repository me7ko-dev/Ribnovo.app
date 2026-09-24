import { connection } from "next/server";
import { getMe } from "./auth";
import { hasSupabase } from "./env";
import { addDays, sofiaStartOfDay } from "./format";
import { sampleData } from "./sample-data";
import { createClient } from "./supabase/server";
import type { Alert, Comment, Post, Profile, VillageEvent } from "./types";

// Всички четения от базата са тук. Докато Supabase не е свързан,
// екраните показват примерни данни.

// „!..._fkey“ казва точно коя връзка към профила да се ползва (постовете имат и харесвания)
const author = (table: string) => `author:profiles!${table}_author_id_fkey(id, full_name, organization, role, avatar_url)`;
export const ALERT_FIELDS = `id, category, title, body, is_important, expected_until, resolved_at, created_at, author_id, ${author("alerts")}`;
export const EVENT_FIELDS = `id, title, description, location, starts_at, ends_at, category, image_url, status, created_at, author_id, ${author("events")}`;
export const POST_FIELDS = `id, kind, title, body, image_url, status, published_at, created_at, like_count, comment_count, author_id, ${author("posts")}`;
const COMMENT_FIELDS = `id, post_id, body, created_at, author_id, ${author("comments")}`;

export const FEED_PAGE_SIZE = 15;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (id: string) => UUID.test(id);

function fail(what: string, error: { message: string }): never {
  console.error(`Грешка при четене (${what}):`, error.message);
  throw new Error(`Неуспешно зареждане: ${what}`);
}

// Отбелязва кои публикации е харесал влезлият потребител
async function withMyLikes(posts: Post[]): Promise<Post[]> {
  const me = await getMe();
  if (!me || posts.length === 0) return posts;
  const supabase = await createClient();
  const { data } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", me.id)
    .in(
      "post_id",
      posts.map((p) => p.id),
    );
  const liked = new Set((data ?? []).map((r) => r.post_id as string));
  return posts.map((p) => ({ ...p, liked_by_me: liked.has(p.id) }));
}

// ---------- Начало ----------

export type DataSource = "supabase" | "sample" | "sample-after-error";

export type HomeData = {
  topAlert: Alert | null; // важната аларма най-отгоре
  otherActiveAlerts: number;
  upcomingEvents: VillageEvent[];
  news: Post[];
  source: DataSource;
};

// Спешните са първи, после важните, после най-новите
function pickTopAlert(active: Alert[]) {
  const rank = (a: Alert) => (a.category === "emergency" ? 2 : 0) + (a.is_important ? 1 : 0);
  const sorted = [...active].sort((a, b) => rank(b) - rank(a) || b.created_at.localeCompare(a.created_at));
  const top = sorted[0];
  return top && rank(top) > 0 ? top : null;
}

function buildHome(alerts: Alert[], events: VillageEvent[], news: Post[], source: DataSource): HomeData {
  const active = alerts.filter((a) => !a.resolved_at);
  const topAlert = pickTopAlert(active);
  return {
    topAlert,
    otherActiveAlerts: active.length - (topAlert ? 1 : 0),
    upcomingEvents: events,
    news,
    source,
  };
}

export async function getHomeData(): Promise<HomeData> {
  await connection();
  const now = new Date();
  if (!hasSupabase) {
    const s = sampleData(now);
    return buildHome(s.alerts, s.events, s.posts, "sample");
  }

  const supabase = await createClient();
  const nowIso = now.toISOString();
  const [alerts, events, posts] = await Promise.all([
    supabase.from("alerts").select(ALERT_FIELDS).is("resolved_at", null).order("created_at", { ascending: false }).limit(20),
    supabase
      .from("events")
      .select(EVENT_FIELDS)
      .eq("status", "approved")
      .or(`starts_at.gte.${nowIso},ends_at.gte.${nowIso}`)
      .order("starts_at")
      .limit(8),
    supabase
      .from("posts")
      .select(POST_FIELDS)
      .eq("status", "approved")
      .order("published_at", { ascending: false })
      .limit(10),
  ]);

  const error = alerts.error ?? events.error ?? posts.error;
  if (error) {
    console.error("Грешка при четене от Supabase:", error.message);
    const s = sampleData(now);
    return buildHome(s.alerts, s.events, s.posts, "sample-after-error");
  }

  return buildHome(
    alerts.data as unknown as Alert[],
    events.data as unknown as VillageEvent[],
    await withMyLikes(posts.data as unknown as Post[]),
    "supabase",
  );
}

// ---------- Новини ----------

export async function getFeedPage(page: number) {
  await connection();
  if (!hasSupabase) return { posts: sampleData().posts, hasMore: false };
  const supabase = await createClient();
  const from = (page - 1) * FEED_PAGE_SIZE;
  const { data, error } = await supabase
    .from("posts")
    .select(POST_FIELDS)
    .eq("status", "approved")
    .order("published_at", { ascending: false })
    .range(from, from + FEED_PAGE_SIZE); // един повече, за да знаем има ли следваща страница
  if (error) fail("новини", error);
  const posts = data as unknown as Post[];
  return {
    posts: await withMyLikes(posts.slice(0, FEED_PAGE_SIZE)),
    hasMore: posts.length > FEED_PAGE_SIZE,
  };
}

export async function getPost(id: string): Promise<{ post: Post; comments: Comment[] } | null> {
  await connection();
  if (!hasSupabase) {
    const post = sampleData().posts.find((p) => p.id === id);
    return post ? { post, comments: [] } : null;
  }
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const [post, comments] = await Promise.all([
    supabase.from("posts").select(POST_FIELDS).eq("id", id).maybeSingle(),
    supabase.from("comments").select(COMMENT_FIELDS).eq("post_id", id).order("created_at"),
  ]);
  if (post.error) fail("публикация", post.error);
  if (comments.error) fail("коментари", comments.error);
  if (!post.data) return null;
  const [withLike] = await withMyLikes([post.data as unknown as Post]);
  return { post: withLike, comments: comments.data as unknown as Comment[] };
}

// ---------- Аларми ----------

export async function getAlerts(): Promise<{ active: Alert[]; resolved: Alert[] }> {
  await connection();
  if (!hasSupabase) {
    const { alerts } = sampleData();
    return { active: alerts.filter((a) => !a.resolved_at), resolved: alerts.filter((a) => a.resolved_at) };
  }
  const supabase = await createClient();
  const [active, resolved] = await Promise.all([
    supabase.from("alerts").select(ALERT_FIELDS).is("resolved_at", null).order("created_at", { ascending: false }),
    supabase
      .from("alerts")
      .select(ALERT_FIELDS)
      .not("resolved_at", "is", null)
      .order("resolved_at", { ascending: false })
      .limit(30),
  ]);
  if (active.error) fail("аларми", active.error);
  if (resolved.error) fail("аларми", resolved.error);
  const all = active.data as unknown as Alert[];
  // спешните и важните — първи
  const rank = (a: Alert) => (a.category === "emergency" ? 2 : 0) + (a.is_important ? 1 : 0);
  all.sort((a, b) => rank(b) - rank(a) || b.created_at.localeCompare(a.created_at));
  return { active: all, resolved: resolved.data as unknown as Alert[] };
}

// ---------- Събития ----------

export async function getWeekEvents(monday: string) {
  await connection();
  const start = sofiaStartOfDay(monday).toISOString();
  const end = sofiaStartOfDay(addDays(monday, 7)).toISOString();
  if (!hasSupabase) {
    const { events } = sampleData();
    return {
      week: events.filter((e) => e.starts_at >= start && e.starts_at < end),
      later: events.filter((e) => e.starts_at >= end),
    };
  }
  const supabase = await createClient();
  const [week, later] = await Promise.all([
    supabase
      .from("events")
      .select(EVENT_FIELDS)
      .eq("status", "approved")
      .gte("starts_at", start)
      .lt("starts_at", end)
      .order("starts_at"),
    supabase
      .from("events")
      .select(EVENT_FIELDS)
      .eq("status", "approved")
      .gte("starts_at", end)
      .order("starts_at")
      .limit(10),
  ]);
  if (week.error) fail("събития", week.error);
  if (later.error) fail("събития", later.error);
  return { week: week.data as unknown as VillageEvent[], later: later.data as unknown as VillageEvent[] };
}

export async function getEvent(id: string): Promise<VillageEvent | null> {
  await connection();
  if (!hasSupabase) return sampleData().events.find((e) => e.id === id) ?? null;
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select(EVENT_FIELDS).eq("id", id).maybeSingle();
  if (error) fail("събитие", error);
  return data as unknown as VillageEvent | null;
}

// ---------- Профили ----------

export async function getPublicProfile(id: string): Promise<{ profile: Profile; posts: Post[] } | null> {
  await connection();
  if (!hasSupabase || !isUuid(id)) return null;
  const supabase = await createClient();
  const [profile, posts] = await Promise.all([
    supabase.from("profiles").select("id, full_name, organization, role, avatar_url").eq("id", id).maybeSingle(),
    supabase
      .from("posts")
      .select(POST_FIELDS)
      .eq("author_id", id)
      .eq("status", "approved")
      .order("published_at", { ascending: false })
      .limit(30),
  ]);
  if (profile.error) fail("профил", profile.error);
  if (posts.error) fail("публикации", posts.error);
  if (!profile.data) return null;
  return { profile: profile.data as Profile, posts: await withMyLikes(posts.data as unknown as Post[]) };
}

// Всичко, което съм публикувал (с всички състояния)
export async function getMyContent(meId: string) {
  const supabase = await createClient();
  const [posts, events] = await Promise.all([
    supabase.from("posts").select(POST_FIELDS).eq("author_id", meId).order("created_at", { ascending: false }).limit(50),
    supabase.from("events").select(EVENT_FIELDS).eq("author_id", meId).order("created_at", { ascending: false }).limit(50),
  ]);
  if (posts.error) fail("моите публикации", posts.error);
  if (events.error) fail("моите събития", events.error);
  return { posts: posts.data as unknown as Post[], events: events.data as unknown as VillageEvent[] };
}

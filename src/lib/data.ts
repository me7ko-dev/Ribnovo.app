import { connection } from "next/server";
import { sampleData } from "./sample-data";
import { getPublicSupabase } from "./supabase";
import type { Alert, Post, VillageEvent } from "./types";

const AUTHOR = "author:profiles(full_name, organization, role)";
const ALERT_FIELDS = `id, category, title, body, is_important, expected_until, resolved_at, created_at, ${AUTHOR}`;
const EVENT_FIELDS = "id, title, description, location, starts_at, ends_at, category";
const POST_FIELDS = `id, kind, title, body, image_url, published_at, ${AUTHOR}`;

export type DataSource = "supabase" | "sample" | "sample-after-error";

export type HomeData = {
  // Важната аларма най-отгоре (или null, ако няма)
  topAlert: Alert | null;
  // Колко други активни аларми има
  otherActiveAlerts: number;
  upcomingEvents: VillageEvent[];
  news: Post[];
  source: DataSource;
};

// Спешните са първи, после важните, после най-новите
function pickTopAlert(active: Alert[]) {
  const rank = (a: Alert) =>
    (a.category === "emergency" ? 2 : 0) + (a.is_important ? 1 : 0);
  const sorted = [...active].sort(
    (a, b) => rank(b) - rank(a) || b.created_at.localeCompare(a.created_at),
  );
  const top = sorted[0];
  return top && rank(top) > 0 ? top : null;
}

function buildHome(
  alerts: Alert[],
  events: VillageEvent[],
  news: Post[],
  source: DataSource,
): HomeData {
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
  // Данните се четат при всяко отваряне, а не веднъж при изграждането
  await connection();

  const now = new Date();
  const supabase = getPublicSupabase();
  if (!supabase) {
    const s = sampleData(now);
    return buildHome(s.alerts, s.events, s.posts, "sample");
  }

  const nowIso = now.toISOString();
  const [alerts, events, posts] = await Promise.all([
    supabase
      .from("alerts")
      .select(ALERT_FIELDS)
      .is("resolved_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
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
    events.data as VillageEvent[],
    posts.data as unknown as Post[],
    "supabase",
  );
}

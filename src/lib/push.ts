import webpush from "web-push";
import { VAPID_PUBLIC_KEY } from "./env";
import { createAdminClient } from "./supabase/admin";
import type { AlertCategory } from "./types";

export type PushPayload = {
  title: string;
  body: string;
  url: string; // коя страница да се отвори при докосване
  tag?: string; // известия със същия етикет се заменят, вместо да се трупат
};

type Subscription = { id: string; endpoint: string; p256dh: string; auth: string };

function configure() {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!VAPID_PUBLIC_KEY || !privateKey) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", VAPID_PUBLIC_KEY, privateKey);
  return true;
}

async function deliver(subs: Subscription[], payload: PushPayload, urgent: boolean) {
  const admin = createAdminClient();
  const expired: string[] = [];
  const body = JSON.stringify(payload);
  // по 50 наведнъж, за да не претоварим сървъра
  for (let i = 0; i < subs.length; i += 50) {
    await Promise.all(
      subs.slice(i, i + 50).map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, {
            TTL: 12 * 60 * 60,
            urgency: urgent ? "high" : "normal",
          });
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) expired.push(s.id); // устройството вече не е абонирано
          else console.error("Неуспешно известие:", status, (e as Error).message);
        }
      }),
    );
  }
  if (expired.length && admin) await admin.from("push_subscriptions").delete().in("id", expired);
}

// Праща известие до всички абонирани за този вид. Спешните отиват до всички.
export async function sendPush(category: AlertCategory, payload: PushPayload) {
  const admin = createAdminClient();
  if (!admin || !configure()) {
    console.warn("Известията не са настроени (липсва SUPABASE_SECRET_KEY или VAPID ключове)");
    return;
  }
  let query = admin.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  if (category !== "emergency") query = query.contains("categories", [category]);
  const { data, error } = await query;
  if (error) {
    console.error("Грешка при четене на абонаментите:", error.message);
    return;
  }
  await deliver(data as Subscription[], { tag: category, ...payload }, category === "emergency");
}

// Пробно известие само до едно устройство
export async function sendTestPush(endpoint: string) {
  const admin = createAdminClient();
  if (!admin || !configure()) return false;
  const { data } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("endpoint", endpoint);
  if (!data?.length) return false;
  await deliver(
    data as Subscription[],
    { title: "Рибново", body: "Известията работят! 🎉", url: "/alarmi", tag: "test" },
    false,
  );
  return true;
}

export function pushConfigured() {
  return Boolean(VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && createAdminClient());
}

"use server";

import { getMe } from "@/lib/auth";
import { sendTestPush } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AlertCategory } from "@/lib/types";

const ALL: AlertCategory[] = ["emergency", "utilities", "road", "events", "memorial", "ads"];

type BrowserSubscription = { endpoint: string; keys: { p256dh: string; auth: string } };

// Запазва устройството и избраните видове известия
export async function savePushSubscription(sub: BrowserSubscription, categories: string[]) {
  const admin = createAdminClient();
  if (!admin) return { error: "Известията още не са настроени на сървъра." };
  if (!sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) {
    return { error: "Невалиден абонамент." };
  }
  const chosen = ALL.filter((c) => c === "emergency" || categories.includes(c)); // спешните винаги
  const me = await getMe();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      categories: chosen,
      ...(me ? { user_id: me.id } : {}),
    },
    { onConflict: "endpoint" },
  );
  if (error) {
    console.error("Грешка при запазване на абонамент:", error.message);
    return { error: "Не успяхме да запазим настройките." };
  }
  return {};
}

export async function removePushSubscription(endpoint: string) {
  const admin = createAdminClient();
  if (admin) await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function sendTestNotification(endpoint: string) {
  const ok = await sendTestPush(endpoint);
  return ok ? {} : { error: "Не успяхме да изпратим пробно известие." };
}

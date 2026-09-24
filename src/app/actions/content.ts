"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getMe, isVerified } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/lib/categories";
import { dbErrorMessage } from "@/lib/errors";
import { dateKey, isDateKey, sofiaDateTime } from "@/lib/format";
import { notifyEvent } from "@/lib/notify";
import { sendPush } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";
import type { AlertCategory, FormState } from "@/lib/types";
import { ownImageUrl, text } from "@/lib/validate";

const ALERT_CATEGORIES: AlertCategory[] = ["emergency", "utilities", "road", "events", "memorial", "ads"];
const TIME = /^\d{2}:\d{2}$/;

async function signedIn() {
  const me = await getMe();
  if (!me) redirect("/vhod?next=/publikuvay");
  if (!me.profile.full_name && !me.profile.organization) redirect("/profil?ime=1");
  return me;
}

function checkTitle(title: string) {
  if (title.length < 3 || title.length > 140) return "Заглавието трябва да е между 3 и 140 знака.";
}

// ---------- Новина или обява ----------

export async function createPost(_: FormState, form: FormData): Promise<FormState> {
  const me = await signedIn();
  const kind = form.get("kind") === "ad" ? "ad" : "news";
  const title = text(form, "title");
  const body = text(form, "body");
  const titleError = checkTitle(title);
  if (titleError) return { error: titleError };
  if (body.length < 1 || body.length > 5000) return { error: "Напишете текст (до 5000 знака)." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({ kind, title, body, image_url: ownImageUrl(form, me.id) })
    .select("id, status")
    .single();
  if (error) return { error: dbErrorMessage(error) };

  if (data.status !== "approved") redirect("/profil?izprateno=1");
  if (kind === "ad") {
    after(() => sendPush("ads", { title: `Нова обява: ${title}`, body: body.slice(0, 140), url: `/novini/${data.id}` }));
  }
  redirect(`/novini/${data.id}`);
}

// ---------- Събитие ----------

export async function createEvent(_: FormState, form: FormData): Promise<FormState> {
  const me = await signedIn();
  const title = text(form, "title");
  const titleError = checkTitle(title);
  if (titleError) return { error: titleError };
  const day = text(form, "date");
  const start = text(form, "start");
  const end = text(form, "end");
  if (!isDateKey(day) || !TIME.test(start)) return { error: "Изберете дата и начален час." };
  if (day < dateKey()) return { error: "Датата вече е минала." };
  const startsAt = sofiaDateTime(day, start);
  const endsAt = TIME.test(end) ? sofiaDateTime(day, end) : null;
  if (endsAt && endsAt <= startsAt) return { error: "Краят трябва да е след началото." };
  const category = form.get("category") === "memorial" ? "memorial" : "events";
  const location = text(form, "location").slice(0, 120) || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description: text(form, "description").slice(0, 3000) || null,
      location,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt?.toISOString() ?? null,
      category,
      image_url: ownImageUrl(form, me.id),
    })
    .select("id, status")
    .single();
  if (error) return { error: dbErrorMessage(error) };

  if (data.status !== "approved") redirect("/profil?izprateno=1");
  after(() => notifyEvent(data.id, category, title, startsAt.toISOString(), location));
  redirect(`/sabitiya/${data.id}`);
}

// ---------- Аларма (само проверени профили) ----------

export async function createAlert(_: FormState, form: FormData): Promise<FormState> {
  const me = await signedIn();
  if (!isVerified(me)) return { error: "Само проверени профили (кметство, училище) пускат аларми." };
  const category = String(form.get("category")) as AlertCategory;
  if (!ALERT_CATEGORIES.includes(category)) return { error: "Изберете вид на алармата." };
  const title = text(form, "title");
  const titleError = checkTitle(title);
  if (titleError) return { error: titleError };
  const body = text(form, "body").slice(0, 2000) || null;
  const untilDay = text(form, "until_date");
  const untilTime = text(form, "until_time");
  const expectedUntil =
    isDateKey(untilDay) && TIME.test(untilTime) ? sofiaDateTime(untilDay, untilTime).toISOString() : null;

  const supabase = await createClient();
  const { error } = await supabase.from("alerts").insert({
    category,
    title,
    body,
    is_important: category === "emergency" || form.get("is_important") === "on",
    expected_until: expectedUntil,
  });
  if (error) return { error: dbErrorMessage(error) };

  after(() =>
    sendPush(category, {
      title: `${category === "emergency" ? "🚨 " : "⚠️ "}${CATEGORY_LABELS[category]}: ${title}`,
      body: body?.slice(0, 160) ?? "",
      url: "/alarmi",
    }),
  );
  redirect("/alarmi");
}

export async function resolveAlert(form: FormData) {
  const supabase = await createClient();
  await supabase.from("alerts").update({ resolved_at: new Date().toISOString() }).eq("id", text(form, "id"));
  refresh();
}

// ---------- Харесвания и коментари ----------

export async function toggleLike(postId: string, like: boolean) {
  const me = await getMe();
  if (!me) return { error: "Влезте, за да харесвате." };
  const supabase = await createClient();
  const { error } = like
    ? await supabase.from("post_likes").insert({ post_id: postId })
    : await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", me.id);
  if (error && error.code !== "23505") return { error: dbErrorMessage(error) }; // 23505 = вече харесано
  return {};
}

export async function addComment(_: FormState, form: FormData): Promise<FormState> {
  const me = await getMe();
  if (!me) return { error: "Влезте, за да коментирате." };
  if (!me.profile.full_name && !me.profile.organization) return { error: "Първо попълнете името си в Профил." };
  const body = text(form, "body");
  if (body.length < 1 || body.length > 1000) return { error: "Коментарът трябва да е до 1000 знака." };
  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({ post_id: text(form, "post_id"), body });
  if (error) return { error: dbErrorMessage(error) };
  refresh();
  return { ok: "Коментарът е добавен." };
}

export async function deleteComment(form: FormData) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", text(form, "id"));
  refresh();
}

// ---------- Изтриване ----------

export async function deletePost(form: FormData) {
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", text(form, "id"));
  redirect("/profil");
}

export async function deleteEvent(form: FormData) {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", text(form, "id"));
  redirect("/profil");
}

// ---------- Докладвай ----------

export async function report(_: FormState, form: FormData): Promise<FormState> {
  const me = await getMe();
  if (!me) return { error: "Влезте, за да докладвате." };
  const targetType = text(form, "target_type");
  if (!["post", "event", "alert", "comment"].includes(targetType)) return { error: "Грешна заявка." };
  const reason = text(form, "reason");
  if (reason.length < 3) return { error: "Напишете накратко причината." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .insert({ target_type: targetType, target_id: text(form, "target_id"), reason: reason.slice(0, 500) });
  if (error) return { error: dbErrorMessage(error) };
  return { ok: "Благодарим! Администраторът ще прегледа сигнала." };
}

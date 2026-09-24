"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { getMe, isAdmin } from "@/lib/auth";
import { dbErrorMessage } from "@/lib/errors";
import { sendPush } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";
import type { FormState, UserRole } from "@/lib/types";
import { text } from "@/lib/validate";
import { notifyEvent } from "@/lib/notify";

async function requireAdmin() {
  const me = await getMe();
  if (!isAdmin(me)) throw new Error("Само за администратор");
  return me!;
}

// Одобри или отхвърли новина/обява/събитие
export async function moderate(form: FormData) {
  await requireAdmin();
  const table = form.get("type") === "event" ? "events" : "posts";
  const approve = form.get("decision") === "approve";
  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .update({ status: approve ? "approved" : "rejected" })
    .eq("id", text(form, "id"))
    .select("*")
    .single();

  if (approve && data) {
    if (table === "events") {
      after(() => notifyEvent(data.id, data.category, data.title, data.starts_at, data.location));
    } else if (data.kind === "ad") {
      after(() =>
        sendPush("ads", { title: `Нова обява: ${data.title}`, body: data.body.slice(0, 140), url: `/novini/${data.id}` }),
      );
    }
  }
  refresh();
}

// Доклад: скрий съдържанието или го остави
export async function resolveReport(form: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: rep } = await supabase.from("reports").select("*").eq("id", text(form, "id")).single();
  if (!rep) return;

  if (form.get("hide") === "1") {
    if (rep.target_type === "post") await supabase.from("posts").update({ status: "rejected" }).eq("id", rep.target_id);
    if (rep.target_type === "event") await supabase.from("events").update({ status: "rejected" }).eq("id", rep.target_id);
    if (rep.target_type === "comment") await supabase.from("comments").delete().eq("id", rep.target_id);
    if (rep.target_type === "alert") await supabase.from("alerts").delete().eq("id", rep.target_id);
  }
  // всички доклади за същото съдържание се затварят заедно
  await supabase.from("reports").update({ resolved: true }).eq("target_id", rep.target_id);
  refresh();
}

// Смяна на роля и организация
export async function setRole(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const userId = text(form, "user_id");
  const role = text(form, "role") as UserRole;
  if (!["admin", "verified", "resident"].includes(role)) return { error: "Грешна роля." };
  if (userId === me.id && role !== "admin") return { error: "Не можете да махнете собствените си права." };
  const organization = role === "resident" ? null : text(form, "organization").slice(0, 80) || null;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role, organization }).eq("id", userId);
  if (error) return { error: dbErrorMessage(error) };
  refresh();
  return { ok: "Запазено." };
}

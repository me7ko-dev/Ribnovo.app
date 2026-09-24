"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/auth";
import { authErrorMessage, dbErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { normalizePhone, ownImageUrl, safeNext, text } from "@/lib/validate";

// Адресът на сайта — за линковете в имейлите
async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

function checkPassword(form: FormData) {
  const password = String(form.get("password") ?? "");
  const repeat = String(form.get("password2") ?? "");
  if (password.length < 8) return { error: "Паролата трябва да е поне 8 знака." };
  if (password !== repeat) return { error: "Двете пароли не съвпадат." };
  return { password };
}

// ---------- Регистрация с имейл ----------

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const fullName = text(form, "full_name");
  const email = text(form, "email").toLowerCase();
  if (fullName.length < 2 || fullName.length > 60) return { error: "Напишете име и фамилия (2–60 знака)." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Невалиден имейл адрес." };
  const pw = checkPassword(form);
  if (pw.error) return { error: pw.error };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pw.password!,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/profil`,
    },
  });
  if (error) return { error: authErrorMessage(error) };
  // Supabase не казва директно, че имейлът е зает (за защита) — познаваме го така:
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Вече има профил с този имейл. Опитайте да влезете." };
  }
  if (data.session) redirect("/profil?dobre-doshli=1");
  return {
    ok: `Изпратихме имейл до ${email}. Отворете го и натиснете линка, за да потвърдите профила си. Проверете и папка „Спам“.`,
  };
}

// ---------- Вход с имейл ----------

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Попълнете имейл и парола." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorMessage(error) };
  redirect(safeNext(form.get("next"), "/"));
}

// ---------- Вход с телефон (SMS код) ----------

export type PhoneState = { error?: string; sentTo?: string } | undefined;

export async function sendPhoneCode(_: PhoneState, form: FormData): Promise<PhoneState> {
  const phone = normalizePhone(text(form, "phone"));
  if (!phone) return { error: "Невалиден номер. Пример: 0888 123 456" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { error: authErrorMessage(error) };
  return { sentTo: phone };
}

export async function verifyPhoneCode(prev: PhoneState, form: FormData): Promise<PhoneState> {
  const phone = normalizePhone(text(form, "phone"));
  const token = text(form, "code").replace(/\s/g, "");
  if (!phone) return { error: "Невалиден номер." };
  if (!/^\d{6}$/.test(token)) return { sentTo: phone, error: "Кодът е 6 цифри." };
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) return { sentTo: phone, error: authErrorMessage(error) };
  redirect(safeNext(form.get("next"), "/profil"));
}

// ---------- Забравена парола ----------

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Невалиден имейл адрес." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/nova-parola`,
  });
  if (error?.code?.startsWith("over_")) return { error: authErrorMessage(error) };
  return { ok: "Ако има профил с този имейл, ще получите линк за нова парола. Отворете го на това устройство." };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const pw = checkPassword(form);
  if (pw.error) return { error: pw.error };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw.password! });
  if (error) return { error: authErrorMessage(error) };
  redirect("/profil?parola=1");
}

// ---------- Изход ----------

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---------- Профил ----------

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const me = await getMe();
  if (!me) return { error: "Влезте отново." };
  const fullName = text(form, "full_name");
  if (fullName.length < 2 || fullName.length > 60) return { error: "Напишете име и фамилия (2–60 знака)." };
  const avatarUrl = form.has("image_url") ? ownImageUrl(form, me.id) : me.profile.avatar_url;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_url: avatarUrl })
    .eq("id", me.id);
  if (error) return { error: dbErrorMessage(error) };
  refresh();
  return { ok: "Запазено." };
}

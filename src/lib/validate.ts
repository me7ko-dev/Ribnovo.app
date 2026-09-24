import { SUPABASE_URL } from "./env";

export function text(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

// „0888 123 456“ → „+359888123456“
export function normalizePhone(input: string) {
  let p = input.replace(/[\s\-()/]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  else if (p.startsWith("0")) p = "+359" + p.slice(1);
  else if (p.startsWith("359")) p = "+" + p;
  return /^\+\d{9,15}$/.test(p) ? p : null;
}

// Снимка — само от нашето хранилище и само от папката на потребителя
export function ownImageUrl(form: FormData, userId: string) {
  const url = text(form, "image_url");
  if (!url) return null;
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/images/${userId}/`;
  return url.startsWith(prefix) ? url : null;
}

// Безопасна вътрешна връзка за пренасочване след вход
export function safeNext(value: unknown, fallback = "/") {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
}

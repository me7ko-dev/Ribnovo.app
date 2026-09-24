// Дати и часове на български, винаги по българско време
// (сървърът може да е в друга часова зона).

const TZ = "Europe/Sofia";

const MONTHS_SHORT = [
  "яну", "фев", "мар", "апр", "май", "юни",
  "юли", "авг", "сеп", "окт", "ное", "дек",
];

function parts(date: Date) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const get = (type: string) => Number(p.find((x) => x.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

// Брой дни между две дати по календар (не по 24 часа)
function calendarDaysBetween(from: Date, to: Date) {
  const a = parts(from);
  const b = parts(to);
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) /
      86_400_000,
  );
}

export function dayNumber(iso: string) {
  return String(parts(new Date(iso)).day);
}

export function monthShort(iso: string) {
  return MONTHS_SHORT[parts(new Date(iso)).month - 1];
}

export function time(iso: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// „Днес“, „Утре“ или „Събота“
export function dayLabel(iso: string, now = new Date()) {
  const diff = calendarDaysBetween(now, new Date(iso));
  if (diff === 0) return "Днес";
  if (diff === 1) return "Утре";
  const weekday = new Intl.DateTimeFormat("bg-BG", {
    timeZone: TZ,
    weekday: "long",
  }).format(new Date(iso));
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

// „сряда, 24 септември“
export function todayLong(now = new Date()) {
  return new Intl.DateTimeFormat("bg-BG", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
}

// „преди 2 часа“, „вчера“, „преди 3 дни“
export function timeAgo(iso: string, now = new Date()) {
  const rtf = new Intl.RelativeTimeFormat("bg", { numeric: "auto" });
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 1) return "току-що";
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(calendarDaysBetween(now, new Date(iso)), "day");
}

// „Очаква се до 16:00“ или „Очаква се до утре, 09:00“
export function untilLabel(iso: string, now = new Date()) {
  const diff = calendarDaysBetween(now, new Date(iso));
  const day = diff === 0 ? "" : `${dayLabel(iso, now).toLowerCase()}, `;
  return `Очаква се до ${day}${time(iso)}`;
}

// ---------- Календар (ключ на ден = „2026-09-26“) ----------

export function dateKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

export function addDays(key: string, days: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Понеделникът на седмицата, в която е денят
export function mondayOf(key: string) {
  const weekday = new Date(`${key}T12:00:00Z`).getUTCDay(); // 0 = неделя
  return addDays(key, -((weekday + 6) % 7));
}

// Точният момент на полунощ по българско време за този ден
export function sofiaStartOfDay(key: string) {
  const utcMidnight = new Date(`${key}T00:00:00Z`);
  const sofiaHour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(utcMidnight),
  );
  return new Date(utcMidnight.getTime() - sofiaHour * 3_600_000);
}

// „2026-09-26“ + „11:30“ (българско време) → момент във времето
export function sofiaDateTime(key: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(sofiaStartOfDay(key).getTime() + (h * 60 + m) * 60_000);
}

export function weekdayShort(key: string) {
  return ["нд", "пн", "вт", "ср", "чт", "пт", "сб"][new Date(`${key}T12:00:00Z`).getUTCDay()];
}

// „Събота, 26 септември“
export function longDate(isoOrKey: string) {
  const d = isDateKey(isoOrKey) ? new Date(`${isoOrKey}T12:00:00Z`) : new Date(isoOrKey);
  const s = new Intl.DateTimeFormat("bg-BG", {
    timeZone: isDateKey(isoOrKey) ? "UTC" : TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// „21 – 27 септември“
export function weekRange(monday: string) {
  const sunday = addDays(monday, 6);
  const fmt = (k: string, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("bg-BG", { timeZone: "UTC", ...o }).format(new Date(`${k}T12:00:00Z`));
  const sameMonth = monday.slice(0, 7) === sunday.slice(0, 7);
  return sameMonth
    ? `${fmt(monday, { day: "numeric" })} – ${fmt(sunday, { day: "numeric", month: "long" })}`
    : `${Number(monday.slice(8))} ${MONTHS_SHORT[Number(monday.slice(5, 7)) - 1]} – ${Number(sunday.slice(8))} ${MONTHS_SHORT[Number(sunday.slice(5, 7)) - 1]}`;
}

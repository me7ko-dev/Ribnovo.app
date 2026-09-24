import type { Alert, Author, Post, VillageEvent } from "./types";

// Примерни данни — показват се, докато не е свързана базата в Supabase.
// Същите са и в supabase/seed.sql.

const MAYOR: Author = { full_name: null, organization: "Кметство Рибново", role: "verified" };
const SCHOOL: Author = { full_name: null, organization: "Училището", role: "verified" };
const RESIDENT: Author = { full_name: "Ахмед К.", organization: null, role: "resident" };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Полунощ днес по българско време
function sofiaMidnight(now: Date) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sofia" }).format(now);
  const utcMidnight = new Date(`${day}T00:00:00Z`);
  const sofiaHourAtUtcMidnight = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Sofia",
      hour: "numeric",
      hourCycle: "h23",
    }).format(utcMidnight),
  );
  return new Date(utcMidnight.getTime() - sofiaHourAtUtcMidnight * HOUR);
}

export function sampleData(now = new Date()) {
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const later = (ms: number) => new Date(now.getTime() + ms).toISOString();
  const midnight = sofiaMidnight(now).getTime();
  const at = (days: number, hour: number) =>
    new Date(midnight + days * DAY + hour * HOUR).toISOString();

  const alerts: Alert[] = [
    {
      id: "a1",
      category: "utilities",
      title: "Спиране на водата в горната махала",
      body: "Поради авария на главния водопровод няма да има вода в горната част на селото. Екипът на ВиК работи по отстраняването.",
      is_important: true,
      expected_until: later(4 * HOUR),
      resolved_at: null,
      created_at: ago(40 * MINUTE),
      author: MAYOR,
    },
    {
      id: "a2",
      category: "road",
      title: "Заледен участък по пътя за Гоце Делчев",
      body: "Шофирайте внимателно след завоя при моста. Опесъчаването е започнало.",
      is_important: false,
      expected_until: null,
      resolved_at: null,
      created_at: ago(3 * HOUR),
      author: MAYOR,
    },
    {
      id: "a3",
      category: "utilities",
      title: "Планирано спиране на тока",
      body: "Енергото извърши ремонт на трафопоста. Токът е възстановен.",
      is_important: false,
      expected_until: null,
      resolved_at: ago(DAY),
      created_at: ago(DAY + 6 * HOUR),
      author: MAYOR,
    },
  ];

  const events: VillageEvent[] = [
    {
      id: "e1",
      title: "Сбор на селото",
      description: "Традиционният сбор с музика, хоро и курбан за здраве.",
      location: "Централния площад",
      starts_at: at(2, 11),
      ends_at: at(2, 18),
      category: "events",
    },
    {
      id: "e2",
      title: "Родителска среща",
      description: "Среща с родителите на учениците от 1. до 7. клас.",
      location: "Училището",
      starts_at: at(3, 17),
      ends_at: null,
      category: "events",
    },
    {
      id: "e3",
      title: "Помен (примерно събитие)",
      description: "Близките канят всички на помен в памет на своя близък.",
      location: "Дома на семейството",
      starts_at: at(4, 12),
      ends_at: null,
      category: "memorial",
    },
    {
      id: "e4",
      title: "Футбол: Рибново – Вълкосел",
      description: "Приятелски мач. Елате да подкрепите отбора!",
      location: "Стадиона",
      starts_at: at(6, 16),
      ends_at: null,
      category: "events",
    },
    {
      id: "e5",
      title: "Сватбен ден в традиционни носии",
      description: "Открита репетиция на рибновската сватба за гости на селото.",
      location: "Читалището",
      starts_at: at(9, 10),
      ends_at: null,
      category: "events",
    },
  ];

  const posts: Post[] = [
    {
      id: "p1",
      kind: "news",
      title: "Започва ремонтът на улицата към училището",
      body: "От понеделник започва полагането на нов асфалт. Движението ще бъде ограничено за около две седмици.",
      image_url: null,
      published_at: ago(2 * HOUR),
      author: MAYOR,
    },
    {
      id: "p2",
      kind: "news",
      title: "Читалището набира деца за фолклорния състав",
      body: "Записванията са всеки делничен ден от 16 до 18 часа в читалището. Възраст от 7 до 14 години.",
      image_url: null,
      published_at: ago(DAY),
      author: SCHOOL,
    },
    {
      id: "p3",
      kind: "ad",
      title: "Продавам дърва за огрев",
      body: "Бук и дъб, нарязани и нацепени. Доставка в рамките на селото. Тел. 0888 000 000.",
      image_url: null,
      published_at: ago(2 * DAY),
      author: RESIDENT,
    },
    {
      id: "p4",
      kind: "news",
      title: "Благодарност към доброволците",
      body: "Благодарим на всички, които помогнаха за почистването на реката в събота!",
      image_url: null,
      published_at: ago(4 * DAY),
      author: RESIDENT,
    },
  ];

  return { alerts, events, posts };
}

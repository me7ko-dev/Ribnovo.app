"use client";

import { CalendarDays, Megaphone, Newspaper, Siren } from "lucide-react";
import { useState } from "react";
import { createAlert, createEvent, createPost } from "@/app/actions/content";
import { CATEGORY_LABELS } from "@/lib/categories";
import type { AlertCategory } from "@/lib/types";
import { FormMessage } from "../FormMessage";
import { ImageUpload } from "../ImageUpload";
import { SubmitButton } from "../SubmitButton";
import { useKeepForm } from "./useKeepForm";

export type PublishKind = "novina" | "obyava" | "sabitie" | "alarma";

const TABS = [
  { key: "novina" as const, label: "Новина", icon: Newspaper },
  { key: "sabitie" as const, label: "Събитие", icon: CalendarDays },
  { key: "obyava" as const, label: "Обява", icon: Megaphone },
  { key: "alarma" as const, label: "Аларма", icon: Siren },
];

export function PublishForms({
  userId,
  canAlert,
  initial,
  today,
}: {
  userId: string;
  canAlert: boolean;
  initial: PublishKind;
  today: string;
}) {
  const [kind, setKind] = useState<PublishKind>(initial === "alarma" && !canAlert ? "novina" : initial);
  const tabs = TABS.filter((t) => t.key !== "alarma" || canAlert);

  return (
    <div>
      <div role="tablist" className={`mb-4 grid gap-1 rounded-2xl bg-line/60 p-1 ${tabs.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={kind === key}
            onClick={() => setKind(key)}
            className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-bold ${
              kind === key ? (key === "alarma" ? "bg-alarm text-white" : "bg-paper text-forest shadow-sm") : "text-muted"
            }`}
          >
            <Icon size={19} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {(kind === "novina" || kind === "obyava") && <PostForm key={kind} kind={kind} userId={userId} verified={canAlert} />}
      {kind === "sabitie" && <EventForm userId={userId} today={today} verified={canAlert} />}
      {kind === "alarma" && canAlert && <AlertForm today={today} />}
    </div>
  );
}

function ModerationHint({ verified }: { verified: boolean }) {
  return (
    <p className="text-xs text-muted">
      {verified
        ? "Като проверен профил публикацията ви излиза веднага."
        : "Публикацията ще се появи, след като администраторът я одобри."}
    </p>
  );
}

function PostForm({ kind, userId, verified }: { kind: "novina" | "obyava"; userId: string; verified: boolean }) {
  const [state, action, pending] = useKeepForm(createPost);
  const ad = kind === "obyava";
  return (
    <form onSubmit={action} className="card space-y-4 p-5">
      <input type="hidden" name="kind" value={ad ? "ad" : "news"} />
      <div>
        <label htmlFor="title" className="label">
          Заглавие
        </label>
        <input id="title" name="title" required minLength={3} maxLength={140} placeholder={ad ? "Напр. Продавам дърва за огрев" : "Напр. Ремонт на улицата към училището"} className="input" />
      </div>
      <div>
        <label htmlFor="body" className="label">
          Текст
        </label>
        <textarea id="body" name="body" required rows={6} maxLength={5000} placeholder={ad ? "Описание, цена, телефон за връзка…" : "Какво се случва?"} className="input" />
      </div>
      <div>
        <span className="label">Снимка (по желание)</span>
        <ImageUpload userId={userId} />
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingText="Публикуване…">Публикувай</SubmitButton>
      <ModerationHint verified={verified} />
    </form>
  );
}

function EventForm({ userId, today, verified }: { userId: string; today: string; verified: boolean }) {
  const [state, action, pending] = useKeepForm(createEvent);
  return (
    <form onSubmit={action} className="card space-y-4 p-5">
      <div>
        <label htmlFor="title" className="label">
          Име на събитието
        </label>
        <input id="title" name="title" required minLength={3} maxLength={140} placeholder="Напр. Сбор на селото" className="input" />
      </div>
      <fieldset>
        <legend className="label">Вид</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "events", label: "Събитие" },
            { value: "memorial", label: "Възпоменание" },
          ].map((o, i) => (
            <label key={o.value} className="flex items-center gap-2 rounded-2xl border border-line bg-paper px-4 py-3 font-semibold has-[:checked]:border-forest has-[:checked]:bg-forest-soft">
              <input type="radio" name="category" value={o.value} defaultChecked={i === 0} className="accent-forest" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="date" className="label">
          Дата
        </label>
        <input id="date" name="date" type="date" min={today} defaultValue={today} required className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start" className="label">
            Начало
          </label>
          <input id="start" name="start" type="time" required defaultValue="18:00" className="input" />
        </div>
        <div>
          <label htmlFor="end" className="label">
            Край (по желание)
          </label>
          <input id="end" name="end" type="time" className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="location" className="label">
          Място
        </label>
        <input id="location" name="location" maxLength={120} placeholder="Напр. Читалището" className="input" />
      </div>
      <div>
        <label htmlFor="description" className="label">
          Описание
        </label>
        <textarea id="description" name="description" rows={4} maxLength={3000} className="input" />
      </div>
      <div>
        <span className="label">Снимка или плакат (по желание)</span>
        <ImageUpload userId={userId} />
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingText="Изпращане…">Добави събитието</SubmitButton>
      <ModerationHint verified={verified} />
    </form>
  );
}

const ALERT_CATEGORIES: AlertCategory[] = ["emergency", "utilities", "road", "events", "memorial", "ads"];

function AlertForm({ today }: { today: string }) {
  const [state, action, pending] = useKeepForm(createAlert);
  const [category, setCategory] = useState<AlertCategory>("utilities");
  return (
    <form onSubmit={action} className="card space-y-4 border-alarm/30 p-5">
      <p className="rounded-2xl bg-alarm-soft px-4 py-3 text-sm font-semibold text-alarm">
        Алармата излиза веднага и праща известие до всички абонирани телефони.
      </p>
      <div>
        <label htmlFor="category" className="label">
          Вид
        </label>
        <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value as AlertCategory)} className="input">
          {ALERT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
              {c === "emergency" ? " (до всички)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="label">
          Какво се случва
        </label>
        <input id="title" name="title" required minLength={3} maxLength={140} placeholder="Напр. Спиране на водата в горната махала" className="input" />
      </div>
      <div>
        <label htmlFor="body" className="label">
          Подробности
        </label>
        <textarea id="body" name="body" rows={4} maxLength={2000} className="input" />
      </div>
      <fieldset>
        <legend className="label">Очаква се до (по желание)</legend>
        <div className="grid grid-cols-2 gap-3">
          <input aria-label="Дата" name="until_date" type="date" min={today} defaultValue={today} className="input" />
          <input aria-label="Час" name="until_time" type="time" className="input" />
        </div>
      </fieldset>
      {category !== "emergency" && (
        <label className="flex items-start gap-3 rounded-2xl border border-line bg-paper p-4">
          <input type="checkbox" name="is_important" defaultChecked className="mt-1 h-5 w-5 accent-alarm" />
          <span>
            <b>Важна</b>
            <span className="block text-sm text-muted">Показва се в оранжево най-горе на началния екран.</span>
          </span>
        </label>
      )}
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="btn-alarm w-full" pendingText="Изпращане…">
        Пусни алармата
      </SubmitButton>
    </form>
  );
}

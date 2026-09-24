"use client";

import Link from "next/link";
import { BellOff, BellRing, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription, sendTestNotification } from "@/app/actions/push";
import { CATEGORY_LABELS } from "@/lib/categories";
import { VAPID_PUBLIC_KEY } from "@/lib/env";
import type { AlertCategory } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";
import { isIOS, isStandalone } from "./device";
import { Switch } from "./Switch";

const CATEGORIES: { key: AlertCategory; hint: string }[] = [
  { key: "emergency", hint: "Винаги включени" },
  { key: "utilities", hint: "Спиране на ток и вода" },
  { key: "road", hint: "Затворени пътища, сняг, лед" },
  { key: "events", hint: "Нови събития в селото" },
  { key: "memorial", hint: "Помени и възпоменания" },
  { key: "ads", hint: "Нови обяви" },
];
const STORAGE_KEY = "ribnovo-categories";
const DEFAULT = CATEGORIES.map((c) => c.key as string);

type Support = "checking" | "ok" | "unsupported" | "ios-install" | "not-configured";

function keyToBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function loadCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved)) return saved as string[];
  } catch {}
  return DEFAULT;
}

async function currentSubscription() {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export function NotificationSettings() {
  const [support, setSupport] = useState<Support>("checking");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    (async () => {
      setCategories(loadCategories());
      if (!supported) return setSupport(isIOS() && !isStandalone() ? "ios-install" : "unsupported");
      if (!VAPID_PUBLIC_KEY) return setSupport("not-configured");
      await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      const sub = await currentSubscription();
      setEndpoint(Notification.permission === "granted" ? (sub?.endpoint ?? null) : null);
      setSupport("ok");
    })().catch((e) => {
      console.error(e);
      setSupport("unsupported");
    });
  }, []);

  async function save(cats: string[]) {
    const sub = await currentSubscription();
    if (!sub) return;
    const res = await savePushSubscription(sub.toJSON() as Parameters<typeof savePushSubscription>[0], cats);
    if (res.error) throw new Error(res.error);
    setEndpoint(sub.endpoint);
  }

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await task();
    } catch (e) {
      setMessage({ text: (e as Error).message || "Нещо се обърка.", error: true });
    } finally {
      setBusy(false);
    }
  }

  const enable = () =>
    run(async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Известията са забранени. Разрешете ги от настройките на телефона за този сайт.");
      }
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (!existing) {
        await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID_PUBLIC_KEY) });
      }
      await save(categories);
      setMessage({ text: "Известията са включени." });
    });

  const disable = () =>
    run(async () => {
      const sub = await currentSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setEndpoint(null);
      setMessage({ text: "Известията са изключени." });
    });

  const toggle = (key: string, on: boolean) => {
    const next = on ? [...new Set([...categories, key])] : categories.filter((c) => c !== key);
    setCategories(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    if (endpoint) run(() => save(next));
  };

  const test = () =>
    run(async () => {
      if (!endpoint) return;
      const res = await sendTestNotification(endpoint);
      if (res.error) throw new Error(res.error);
      setMessage({ text: "Изпратено — след малко трябва да получите известие." });
    });

  return (
    <section id="izvestiya" aria-labelledby="izvestiya-title" className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="izvestiya-title" className="font-serif text-xl font-semibold">
          Известия
        </h2>
        {support === "ok" && endpoint && (
          <span className="flex items-center gap-1 rounded-full bg-forest-soft px-2.5 py-1 text-xs font-bold text-forest">
            <BellRing size={14} aria-hidden /> Включени
          </span>
        )}
      </div>

      {support === "checking" && <Loader2 className="mt-3 animate-spin text-muted" aria-label="Зареждане" />}

      {support === "ios-install" && (
        <p className="mt-2 text-sm text-ink">
          На iPhone известията работят, след като добавите Рибново на началния екран.{" "}
          <Link href="/instalirane" className="font-bold text-forest underline">
            Вижте как
          </Link>
        </p>
      )}
      {support === "unsupported" && (
        <p className="mt-2 text-sm text-muted">Този браузър не поддържа известия. Опитайте с Chrome или Safari.</p>
      )}
      {support === "not-configured" && (
        <p className="mt-2 text-sm text-muted">Известията още не са настроени от администратора.</p>
      )}

      {support === "ok" && !endpoint && (
        <button onClick={enable} disabled={busy} className="btn-primary mt-3 w-full">
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <BellRing size={18} aria-hidden />}
          Включи известията
        </button>
      )}

      <ul className="mt-3 divide-y divide-line">
        {CATEGORIES.map(({ key, hint }) => {
          const locked = key === "emergency";
          const on = locked || categories.includes(key);
          return (
            <li key={key} className="flex items-center gap-3 py-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${key === "emergency" ? "bg-alarm-soft text-alarm" : "bg-forest-soft text-forest"}`}>
                <CategoryIcon category={key} size={18} />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block font-bold">{CATEGORY_LABELS[key]}</span>
                <span className="text-xs text-muted">{hint}</span>
              </span>
              <Switch
                checked={on}
                disabled={locked || busy}
                label={CATEGORY_LABELS[key]}
                onChange={(v) => toggle(key, v)}
              />
            </li>
          );
        })}
      </ul>

      {message && (
        <p role="status" className={`mt-2 text-sm font-semibold ${message.error ? "text-alarm" : "text-forest"}`}>
          {message.text}
        </p>
      )}

      {support === "ok" && endpoint && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={test} disabled={busy} className="btn-small bg-cream text-forest">
            <BellRing size={16} aria-hidden /> Пробно известие
          </button>
          <button onClick={disable} disabled={busy} className="btn-small text-muted">
            <BellOff size={16} aria-hidden /> Изключи всички
          </button>
        </div>
      )}
    </section>
  );
}

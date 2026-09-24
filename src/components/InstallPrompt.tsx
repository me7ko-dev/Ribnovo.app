"use client";

import Link from "next/link";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isIOS, isStandalone } from "./device";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "ribnovo-install-dismissed";

// Карта „Инсталирай Рибново“ — на Android с бутон, на iPhone с указания
export function InstallPrompt() {
  const [mode, setMode] = useState<"none" | "android" | "ios">("none");
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- зависи от браузъра, известно е чак тук
    if (isIOS()) setMode("ios");
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setMode("none");
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  if (mode === "none") return null;

  return (
    <div className="card relative mx-4 mb-4 p-4 pr-12">
      <button onClick={dismiss} aria-label="Затвори" className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-cream">
        <X size={18} aria-hidden />
      </button>
      <p className="font-serif text-lg font-semibold text-forest">Сложете Рибново на телефона</p>
      {mode === "android" ? (
        <>
          <p className="mt-1 text-sm text-muted">Отваря се с едно докосване и получавате известия за аларми.</p>
          <button
            className="btn-primary mt-3"
            onClick={async () => {
              await deferred?.prompt();
              const choice = await deferred?.userChoice;
              if (choice?.outcome === "accepted") setMode("none");
            }}
          >
            <Download size={18} aria-hidden />
            Инсталирай
          </button>
        </>
      ) : (
        <ol className="mt-2 space-y-1.5 text-sm text-ink">
          <li className="flex items-center gap-2">
            1. Натиснете <Share size={17} className="text-forest" aria-label="Сподели" /> <b>Сподели</b> долу
          </li>
          <li className="flex items-center gap-2">
            2. Изберете <SquarePlus size={17} className="text-forest" aria-hidden /> <b>Добави към начален екран</b>
          </li>
          <li>
            3. Отворете Рибново от иконата. <Link href="/instalirane" className="font-bold text-forest underline">Подробно</Link>
          </li>
        </ol>
      )}
    </div>
  );
}

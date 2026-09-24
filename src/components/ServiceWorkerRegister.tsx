"use client";

import { useEffect } from "react";

// Регистрира service worker-а (нужен за инсталиране и известия)
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((e) => {
        console.error("Service worker не се регистрира:", e);
      });
    }
  }, []);
  return null;
}

import { WifiOff } from "lucide-react";

export const metadata = { title: "Няма интернет · Рибново" };

// Показва се, когато телефонът няма интернет
export default function OfflinePage() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <WifiOff size={48} className="mx-auto text-muted" aria-hidden />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-forest">Няма връзка с интернет</h1>
        <p className="mt-2 text-muted">Проверете мобилните данни или Wi-Fi и опитайте отново.</p>
        {/* обикновен линк: при липса на интернет трябва пълно презареждане */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="btn-primary mt-6">
          Опитай отново
        </a>
      </div>
    </div>
  );
}

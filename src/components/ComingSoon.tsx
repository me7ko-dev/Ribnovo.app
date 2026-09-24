import type { ReactNode } from "react";

// Временна страница за екраните от следващите фази
export function ComingSoon({ title, phase, children }: { title: string; phase: number; children: ReactNode }) {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <h1 className="font-serif text-3xl font-semibold text-forest">{title}</h1>
      <div className="mt-6 rounded-3xl border border-dashed border-line bg-paper p-5">
        <p className="text-xs font-bold tracking-wider text-muted uppercase">Идва във Фаза {phase}</p>
        <div className="mt-2 text-[15px] leading-relaxed text-ink">{children}</div>
      </div>
    </div>
  );
}

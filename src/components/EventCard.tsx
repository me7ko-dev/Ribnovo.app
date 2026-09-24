import { MapPin } from "lucide-react";
import { dayLabel, dayNumber, monthShort, time } from "@/lib/format";
import type { VillageEvent } from "@/lib/types";

// Карта в хоризонталния списък „Предстои“
export function EventCard({ event }: { event: VillageEvent }) {
  const memorial = event.category === "memorial";
  return (
    <article className="flex w-[230px] shrink-0 snap-start flex-col rounded-3xl border border-line bg-paper p-4">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-14 w-12 shrink-0 place-content-center rounded-2xl text-center ${
            memorial ? "bg-ink/80 text-cream" : "bg-forest text-cream"
          }`}
        >
          <span className="font-serif text-xl leading-none font-semibold">{dayNumber(event.starts_at)}</span>
          <span className="mt-0.5 text-[11px] font-semibold tracking-wide uppercase opacity-80">
            {monthShort(event.starts_at)}
          </span>
        </div>
        <div className="text-sm leading-tight">
          <p className="font-bold text-ink">{dayLabel(event.starts_at)}</p>
          <p className="text-muted">
            {time(event.starts_at)}
            {event.ends_at && ` – ${time(event.ends_at)}`}
          </p>
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 font-serif text-[17px] leading-snug font-semibold">{event.title}</h3>
      {memorial && <p className="mt-1 text-xs font-semibold text-muted">Възпоменание</p>}
      {event.location && (
        <p className="mt-auto flex items-center gap-1 pt-3 text-sm text-muted">
          <MapPin size={14} aria-hidden className="shrink-0" />
          <span className="truncate">{event.location}</span>
        </p>
      )}
    </article>
  );
}

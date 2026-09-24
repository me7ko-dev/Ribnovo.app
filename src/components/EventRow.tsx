import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { time } from "@/lib/format";
import type { VillageEvent } from "@/lib/types";

// Събитие в списъка на календара
export function EventRow({ event }: { event: VillageEvent }) {
  const memorial = event.category === "memorial";
  return (
    <Link href={`/sabitiya/${event.id}`} className="card flex items-center gap-3 p-3.5">
      <div className={`w-14 shrink-0 rounded-2xl py-2 text-center ${memorial ? "bg-ink/80 text-cream" : "bg-forest-soft text-forest"}`}>
        <p className="text-sm font-bold">{time(event.starts_at)}</p>
        {event.ends_at && <p className="text-[11px] opacity-80">до {time(event.ends_at)}</p>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[17px] leading-snug font-semibold">{event.title}</p>
        {memorial && <p className="text-xs font-semibold text-muted">Възпоменание</p>}
        {event.location && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin size={13} aria-hidden className="shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
      </div>
      <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
    </Link>
  );
}

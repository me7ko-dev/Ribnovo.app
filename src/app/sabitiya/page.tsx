import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { EventRow } from "@/components/EventRow";
import { PageHeader } from "@/components/PageHeader";
import { getWeekEvents } from "@/lib/data";
import { addDays, dateKey, dayNumber, isDateKey, longDate, mondayOf, weekRange, weekdayShort } from "@/lib/format";
import type { VillageEvent } from "@/lib/types";

export const metadata = { title: "Събития · Рибново" };

export default async function EventsPage(props: PageProps<"/sabitiya">) {
  const { sedmica } = await props.searchParams;
  const today = dateKey();
  const monday = mondayOf(isDateKey(sedmica) ? sedmica : today);
  const thisWeek = monday === mondayOf(today);
  const { week, later } = await getWeekEvents(monday);

  // групираме събитията по дни
  const byDay = new Map<string, VillageEvent[]>();
  for (const e of week) {
    const key = dateKey(new Date(e.starts_at));
    byDay.set(key, [...(byDay.get(key) ?? []), e]);
  }
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <>
      <PageHeader
        title="Събития"
        action={
          <Link href="/publikuvay?vid=sabitie" className="btn-small bg-forest text-cream">
            <Plus size={17} aria-hidden /> Добави
          </Link>
        }
      />

      <div className="px-4">
        {/* Седмичен календар */}
        <section aria-label="Седмица" className="card p-3">
          <div className="flex items-center justify-between px-1">
            <Link href={`/sabitiya?sedmica=${addDays(monday, -7)}`} aria-label="Предишна седмица" className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream">
              <ChevronLeft size={22} aria-hidden />
            </Link>
            <div className="text-center">
              <p className="font-serif text-lg font-semibold">{weekRange(monday)}</p>
              {!thisWeek && (
                <Link href="/sabitiya" className="text-xs font-bold text-forest">
                  Към тази седмица
                </Link>
              )}
            </div>
            <Link href={`/sabitiya?sedmica=${addDays(monday, 7)}`} aria-label="Следваща седмица" className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream">
              <ChevronRight size={22} aria-hidden />
            </Link>
          </div>
          <ol className="mt-2 grid grid-cols-7 gap-1">
            {days.map((key) => {
              const count = byDay.get(key)?.length ?? 0;
              const isToday = key === today;
              const past = key < today;
              const Tag = count > 0 ? "a" : "div";
              return (
                <li key={key}>
                  <Tag
                    {...(count > 0 ? { href: `#den-${key}` } : {})}
                    className={`flex flex-col items-center rounded-2xl py-2 ${isToday ? "bg-forest text-cream" : past ? "text-muted/60" : "text-ink"} ${count > 0 && !isToday ? "bg-forest-soft" : ""}`}
                  >
                    <span className="text-[11px] font-semibold uppercase">{weekdayShort(key)}</span>
                    <span className="font-serif text-lg leading-tight font-semibold">{dayNumber(`${key}T12:00:00Z`)}</span>
                    <span className="flex h-2 items-center gap-0.5" aria-label={count ? `${count} събития` : undefined}>
                      {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-cream" : "bg-alarm"}`} />
                      ))}
                    </span>
                  </Tag>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Списък за седмицата */}
        <div className="mt-6 space-y-6">
          {week.length === 0 && <p className="text-center text-muted">Няма събития през тази седмица.</p>}
          {days
            .filter((k) => byDay.has(k))
            .map((key) => (
              <section key={key} id={`den-${key}`} className="scroll-mt-4">
                <h2 className="mb-2 text-sm font-bold tracking-wide text-muted uppercase">
                  {key === today ? "Днес · " : ""}
                  {longDate(key)}
                </h2>
                <div className="space-y-2">
                  {byDay.get(key)!.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </div>
              </section>
            ))}
        </div>

        {later.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-[22px] font-semibold">По-нататък</h2>
            <div className="mt-3 space-y-2">
              {later.map((e) => (
                <div key={e.id}>
                  <p className="mb-1 pl-1 text-xs font-bold text-muted">{longDate(e.starts_at)}</p>
                  <EventRow event={e} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

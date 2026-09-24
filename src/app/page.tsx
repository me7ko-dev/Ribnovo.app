import Link from "next/link";
import { Bell, ChevronRight, Sun } from "lucide-react";
import { AlertBanner } from "@/components/AlertBanner";
import { EventCard } from "@/components/EventCard";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getHomeData } from "@/lib/data";
import { todayLong } from "@/lib/format";

function alertsWord(n: number) {
  return n === 1 ? "активна аларма" : "активни аларми";
}

export default async function HomePage() {
  const { topAlert, otherActiveAlerts, upcomingEvents, news, source } = await getHomeData();
  const activeCount = otherActiveAlerts + (topAlert ? 1 : 0);

  return (
    <>
      <header className="flex items-end justify-between px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
        <div>
          <p className="text-sm font-medium text-muted first-letter:uppercase">{todayLong()}</p>
          <h1 className="font-serif text-[34px] leading-tight font-semibold text-forest">Рибново</h1>
        </div>
        <Link
          href="/alarmi"
          aria-label={`Аларми: ${activeCount} ${alertsWord(activeCount)}`}
          className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-ink"
        >
          <Bell size={20} aria-hidden />
          {activeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-alarm px-1 text-[11px] font-bold text-white ring-2 ring-cream">
              {activeCount}
            </span>
          )}
        </Link>
      </header>

      {source !== "supabase" && (
        <p className="mx-4 mb-4 rounded-2xl border border-dashed border-muted/40 px-4 py-2.5 text-xs text-muted">
          {source === "sample"
            ? "Примерни данни — базата в Supabase още не е свързана."
            : "Няма връзка с базата в Supabase — показваме примерни данни."}
        </p>
      )}

      {/* 1. Активна важна аларма */}
      <section aria-label="Аларми" className="px-4">
        {topAlert ? (
          <AlertBanner alert={topAlert} />
        ) : (
          <div className="flex items-center gap-3 rounded-3xl bg-forest-soft px-4 py-3.5 text-forest">
            <Sun size={20} aria-hidden className="shrink-0" />
            <p className="text-sm font-semibold">Няма важни аларми. Спокоен ден в Рибново.</p>
          </div>
        )}
        {otherActiveAlerts > 0 && (
          <Link
            href="/alarmi"
            className="mt-2 flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3 text-sm"
          >
            <span>
              <span className="font-bold text-alarm">
                {topAlert ? "+ още " : ""}
                {otherActiveAlerts}
              </span>{" "}
              {alertsWord(otherActiveAlerts)}
            </span>
            <ChevronRight size={16} aria-hidden className="text-muted" />
          </Link>
        )}
      </section>

      {/* 2. Предстои */}
      <section aria-labelledby="upcoming" className="mt-8">
        <SectionHeader title="Предстои" href="/sabitiya" linkLabel="Календар" />
        {upcomingEvents.length > 0 ? (
          <div className="no-scrollbar mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="mt-3 px-4 text-sm text-muted">Няма предстоящи събития.</p>
        )}
      </section>

      {/* 3. Новини */}
      <section aria-label="Новини" className="mt-8">
        <SectionHeader title="Новини" />
        {news.length > 0 ? (
          <div className="mt-3 space-y-3 px-4">
            {news.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-3 px-4 text-sm text-muted">Все още няма новини.</p>
        )}
      </section>
    </>
  );
}

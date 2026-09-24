import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/categories";
import { timeAgo, untilLabel } from "@/lib/format";
import type { Alert } from "@/lib/types";
import { AuthorLine } from "./AuthorLine";
import { CategoryIcon } from "./CategoryIcon";

// Оранжевата карта с активната важна аларма
export function AlertBanner({ alert }: { alert: Alert }) {
  return (
    <Link
      href="/alarmi"
      className="block rounded-3xl bg-alarm p-5 text-white shadow-[0_12px_28px_-14px_rgba(180,65,15,0.75)]"
    >
      <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-white/85">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        Активна аларма
        <span className="text-white/50">·</span>
        <CategoryIcon category={alert.category} size={14} />
        {CATEGORY_LABELS[alert.category]}
      </div>

      <h2 className="mt-3 font-serif text-[22px] leading-snug font-semibold">{alert.title}</h2>
      {alert.body && <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-white/90">{alert.body}</p>}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/20 pt-3 text-sm">
        <span className="flex min-w-0 items-center gap-1.5 text-white/90">
          <Clock size={15} aria-hidden className="shrink-0" />
          <span className="truncate">
            {alert.expected_until ? untilLabel(alert.expected_until) : `Обявена ${timeAgo(alert.created_at)}`}
          </span>
        </span>
        <span className="flex shrink-0 items-center font-semibold">
          Подробно
          <ChevronRight size={16} aria-hidden />
        </span>
      </div>
      <AuthorLine author={alert.author} className="mt-2 text-xs text-white/75" />
    </Link>
  );
}

import { Clock, CheckCircle2 } from "lucide-react";
import { resolveAlert } from "@/app/actions/content";
import { CATEGORY_LABELS } from "@/lib/categories";
import { timeAgo, untilLabel } from "@/lib/format";
import type { Alert } from "@/lib/types";
import { AuthorLine } from "./AuthorLine";
import { CategoryIcon } from "./CategoryIcon";
import { SubmitButton } from "./SubmitButton";

// Аларма в списъка (активна или приключила)
export function AlertCard({ alert, canResolve }: { alert: Alert; canResolve: boolean }) {
  const resolved = Boolean(alert.resolved_at);
  const hot = !resolved && (alert.is_important || alert.category === "emergency");
  return (
    <article
      className={`card overflow-hidden border-l-[6px] p-4 ${resolved ? "border-l-line opacity-80" : hot ? "border-l-alarm" : "border-l-forest"}`}
    >
      <div className={`flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase ${resolved ? "text-muted" : hot ? "text-alarm" : "text-forest"}`}>
        <CategoryIcon category={alert.category} size={14} />
        {CATEGORY_LABELS[alert.category]}
        <span className="text-muted">·</span>
        <span className="text-muted normal-case">{resolved ? `приключи ${timeAgo(alert.resolved_at!)}` : timeAgo(alert.created_at)}</span>
      </div>
      <h3 className="mt-1.5 font-serif text-lg leading-snug font-semibold">{alert.title}</h3>
      {alert.body && <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-ink/80">{alert.body}</p>}
      {!resolved && alert.expected_until && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Clock size={15} aria-hidden /> {untilLabel(alert.expected_until)}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <AuthorLine author={alert.author} className="text-sm font-semibold text-forest" />
        {canResolve && !resolved && (
          <form action={resolveAlert}>
            <input type="hidden" name="id" value={alert.id} />
            <SubmitButton className="btn-small bg-forest-soft text-forest">
              <CheckCircle2 size={16} aria-hidden /> Приключи
            </SubmitButton>
          </form>
        )}
      </div>
    </article>
  );
}

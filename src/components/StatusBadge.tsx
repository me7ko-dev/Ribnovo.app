import type { ModerationStatus } from "@/lib/types";

const STYLES: Record<ModerationStatus, [string, string]> = {
  pending: ["Чака одобрение", "bg-line text-muted"],
  approved: ["Публикувано", "bg-forest-soft text-forest"],
  rejected: ["Отхвърлено", "bg-alarm-soft text-alarm"],
};

export function StatusBadge({ status }: { status: ModerationStatus }) {
  const [label, style] = STYLES[status];
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>{label}</span>;
}

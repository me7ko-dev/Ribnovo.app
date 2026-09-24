import { CalendarDays, Flower2, Megaphone, Siren, Snowflake, Zap } from "lucide-react";
import type { AlertCategory } from "@/lib/types";

const ICONS = {
  emergency: Siren,
  utilities: Zap,
  road: Snowflake,
  events: CalendarDays,
  memorial: Flower2,
  ads: Megaphone,
} satisfies Record<AlertCategory, unknown>;

export function CategoryIcon({ category, size = 16 }: { category: AlertCategory; size?: number }) {
  const Icon = ICONS[category];
  return <Icon size={size} aria-hidden />;
}

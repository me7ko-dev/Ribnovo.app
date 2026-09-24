import type { AlertCategory } from "./types";

// Имена на видовете аларми/известия, както се виждат в приложението
export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  emergency: "Спешни",
  utilities: "Ток и вода",
  road: "Път и сняг",
  events: "Събития",
  memorial: "Възпоменания",
  ads: "Обяви",
};

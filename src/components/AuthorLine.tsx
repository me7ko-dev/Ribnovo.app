import { BadgeCheck } from "lucide-react";
import type { Author } from "@/lib/types";

// „Кметство Рибново ✓“ — отметка за проверени профили
export function AuthorLine({ author, className = "" }: { author: Author | null; className?: string }) {
  if (!author) return null;
  const name = author.organization || author.full_name || "Жител";
  const verified = author.role === "verified" || author.role === "admin";
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {name}
      {verified && <BadgeCheck size={15} className="shrink-0" aria-label="Проверен профил" />}
    </span>
  );
}

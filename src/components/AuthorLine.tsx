import { BadgeCheck } from "lucide-react";
import { displayName } from "@/lib/names";
import type { Author } from "@/lib/types";

// „Кметство Рибново ✓“ — отметка за проверени профили
export function AuthorLine({ author, className = "" }: { author: Author | null; className?: string }) {
  if (!author) return null;
  const verified = author.role === "verified" || author.role === "admin";
  return (
    <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>
      <span className="truncate">{displayName(author)}</span>
      {verified && <BadgeCheck size={15} className="shrink-0" aria-label="Проверен профил" />}
    </span>
  );
}

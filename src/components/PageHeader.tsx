import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  return (
    <header className="flex items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
      {back && (
        <Link
          href={back}
          aria-label="Назад"
          className="-ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink hover:bg-paper"
        >
          <ChevronLeft size={26} aria-hidden />
        </Link>
      )}
      <h1 className="min-w-0 flex-1 truncate font-serif text-[30px] leading-tight font-semibold text-forest">{title}</h1>
      {action}
    </header>
  );
}

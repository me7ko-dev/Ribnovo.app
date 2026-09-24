import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between px-4">
      <h2 className="font-serif text-[22px] font-semibold text-ink">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="flex items-center text-sm font-semibold text-forest">
          {linkLabel}
          <ChevronRight size={16} aria-hidden />
        </Link>
      )}
    </div>
  );
}

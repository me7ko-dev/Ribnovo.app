"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, House, Plus, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Начало", icon: House },
  { href: "/alarmi", label: "Аларми", icon: Bell },
  { href: "/publikuvay", label: "Публикувай", icon: Plus, primary: true },
  { href: "/sabitiya", label: "Събития", icon: CalendarDays },
  { href: "/profil", label: "Профил", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Основно меню"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, primary }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 pt-2 pb-2.5 text-[11px] ${
                  active ? "font-bold text-forest" : "font-medium text-muted"
                }`}
              >
                {primary ? (
                  <span className="-mt-5 grid h-12 w-12 place-items-center rounded-full bg-forest text-cream shadow-lg shadow-forest/30 ring-4 ring-cream">
                    <Icon size={24} strokeWidth={2.4} />
                  </span>
                ) : (
                  <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

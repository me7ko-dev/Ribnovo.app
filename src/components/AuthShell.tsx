import type { ReactNode } from "react";
import { hasSupabase } from "@/lib/env";
import { NoDatabase } from "./NoDatabase";
import { PageHeader } from "./PageHeader";

// Обща рамка за екраните за вход и регистрация
export function AuthShell({ title, intro, back, children, footer }: {
  title: string;
  intro?: ReactNode;
  back?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} back={back} />
      <div className="px-4">
        {intro && <p className="mb-5 text-[15px] leading-relaxed text-muted">{intro}</p>}
        {hasSupabase ? <div className="card p-5">{children}</div> : <NoDatabase />}
        {footer && <div className="mt-5 text-center text-sm">{footer}</div>}
      </div>
    </>
  );
}

import { CircleAlert, CircleCheck } from "lucide-react";
import type { FormState } from "@/lib/types";

export function FormMessage({ state }: { state: FormState }) {
  if (state?.error) {
    return (
      <p role="alert" className="flex items-start gap-2 rounded-2xl bg-alarm-soft px-4 py-3 text-sm font-semibold text-alarm">
        <CircleAlert size={18} className="mt-px shrink-0" aria-hidden />
        {state.error}
      </p>
    );
  }
  if (state?.ok) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-2xl bg-forest-soft px-4 py-3 text-sm font-semibold text-forest">
        <CircleCheck size={18} className="mt-px shrink-0" aria-hidden />
        {state.ok}
      </p>
    );
  }
  return null;
}

export function Notice({ tone = "ok", children }: { tone?: "ok" | "warn" | "info"; children: React.ReactNode }) {
  const styles = {
    ok: "bg-forest-soft text-forest",
    warn: "bg-alarm-soft text-alarm",
    info: "border border-dashed border-muted/40 text-muted",
  }[tone];
  return <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${styles}`}>{children}</div>;
}

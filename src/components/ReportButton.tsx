"use client";

import { Flag } from "lucide-react";
import { useState } from "react";
import { report } from "@/app/actions/content";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useKeepForm } from "./forms/useKeepForm";

const REASONS = ["Невярна информация", "Обидно съдържание", "Реклама / спам", "Лични данни", "Друго"];

// „Докладвай“ — праща сигнал до администратора
export function ReportButton({ targetType, targetId, compact = false }: { targetType: string; targetId: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useKeepForm(report);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-small text-muted hover:bg-cream">
        <Flag size={compact ? 14 : 17} aria-hidden />
        {!compact && "Докладвай"}
        {compact && <span className="sr-only">Докладвай</span>}
      </button>
    );
  }

  if (state?.ok) return <FormMessage state={state} />;

  return (
    <form onSubmit={action} className="card mt-2 w-full space-y-3 p-4">
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      <p className="font-bold">Какъв е проблемът?</p>
      <select name="reason" className="input" defaultValue={REASONS[0]}>
        {REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <FormMessage state={state} />
      <div className="flex gap-2">
        <SubmitButton pending={pending} className="btn-alarm flex-1">Изпрати сигнал</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Отказ
        </button>
      </div>
    </form>
  );
}

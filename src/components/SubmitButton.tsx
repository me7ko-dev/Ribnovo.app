"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// Бутон за изпращане, който показва „зарежда…“ докато чака
export function SubmitButton({
  children,
  className = "btn-primary w-full",
  pendingText,
  disabled,
  pending: pendingProp,
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
  disabled?: boolean;
  pending?: boolean; // подава се от useKeepForm
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

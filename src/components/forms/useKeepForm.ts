"use client";

import { startTransition, useActionState, type FormEvent } from "react";

// Като useActionState, но формулярът НЕ се изчиства след грешка —
// човекът не губи написания текст (напр. дълга новина или имейла си).
export function useKeepForm<S>(action: (state: Awaited<S>, form: FormData) => Promise<S>) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, undefined as Awaited<S>);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
  return [state, onSubmit, pending] as const;
}

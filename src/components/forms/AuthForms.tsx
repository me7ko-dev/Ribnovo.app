"use client";

import Link from "next/link";
import { Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import {
  requestPasswordReset,
  sendPhoneCode,
  signIn,
  signUp,
  updatePassword,
  verifyPhoneCode,
} from "@/app/actions/auth";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";
import { useKeepForm } from "./useKeepForm";

function PasswordFields({ newPassword = false }: { newPassword?: boolean }) {
  return (
    <>
      <div>
        <label htmlFor="password" className="label">
          {newPassword ? "Нова парола" : "Парола"}
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" />
        <p className="mt-1 text-xs text-muted">Поне 8 знака.</p>
      </div>
      <div>
        <label htmlFor="password2" className="label">
          Повторете паролата
        </label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" minLength={8} required className="input" />
      </div>
    </>
  );
}

// ---------- Вход: имейл или телефон ----------

export function SignInForm({ next }: { next: string }) {
  const [tab, setTab] = useState<"email" | "phone">("email");
  return (
    <div>
      <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-line/60 p-1">
        {[
          { key: "email" as const, label: "С имейл", icon: Mail },
          { key: "phone" as const, label: "С телефон", icon: Smartphone },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold ${tab === key ? "bg-paper text-forest shadow-sm" : "text-muted"}`}
          >
            <Icon size={17} aria-hidden /> {label}
          </button>
        ))}
      </div>
      {tab === "email" ? <EmailSignIn next={next} /> : <PhoneSignIn next={next} />}
    </div>
  );
}

function EmailSignIn({ next }: { next: string }) {
  const [state, action, actionPending] = useKeepForm(signIn);
  return (
    <form onSubmit={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">
          Имейл
        </label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required className="input" />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="label">
            Парола
          </label>
          <Link href="/zabravena-parola" className="text-sm font-semibold text-forest">
            Забравена парола?
          </Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={actionPending} pendingText="Влизане…">Влез</SubmitButton>
    </form>
  );
}

function PhoneSignIn({ next }: { next: string }) {
  const [sendState, sendAction, sendActionPending] = useKeepForm(sendPhoneCode);
  const [verifyState, verifyAction, verifyActionPending] = useKeepForm(verifyPhoneCode);
  const sentTo = verifyState?.sentTo ?? sendState?.sentTo;

  if (!sentTo) {
    return (
      <form onSubmit={sendAction} className="space-y-4">
        <div>
          <label htmlFor="phone" className="label">
            Телефонен номер
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="0888 123 456" required className="input" />
          <p className="mt-1 text-xs text-muted">Ще получите SMS с 6-цифрен код. Ако нямате профил, ще се създаде.</p>
        </div>
        <FormMessage state={sendState} />
        <SubmitButton pending={sendActionPending} pendingText="Изпращане…">Изпрати код</SubmitButton>
      </form>
    );
  }

  return (
    <form onSubmit={verifyAction} className="space-y-4">
      <input type="hidden" name="phone" value={sentTo} />
      <input type="hidden" name="next" value={next} />
      <p className="text-sm">
        Изпратихме код на <b>{sentTo}</b>.
      </p>
      <div>
        <label htmlFor="code" className="label">
          Код от SMS
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={7}
          required
          className="input text-center text-2xl tracking-[0.4em]"
        />
      </div>
      <FormMessage state={verifyState} />
      <SubmitButton pending={verifyActionPending} pendingText="Проверка…">Потвърди</SubmitButton>
    </form>
  );
}

// ---------- Регистрация ----------

export function SignUpForm() {
  const [state, action, actionPending] = useKeepForm(signUp);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form onSubmit={action} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="label">
          Име и фамилия
        </label>
        <input id="full_name" name="full_name" autoComplete="name" required minLength={2} maxLength={60} className="input" />
        <p className="mt-1 text-xs text-muted">Така ще ви виждат другите жители.</p>
      </div>
      <div>
        <label htmlFor="email" className="label">
          Имейл
        </label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required className="input" />
      </div>
      <PasswordFields />
      <FormMessage state={state} />
      <SubmitButton pending={actionPending} pendingText="Създаване…">Създай профил</SubmitButton>
    </form>
  );
}

// ---------- Забравена и нова парола ----------

export function ResetRequestForm() {
  const [state, action, actionPending] = useKeepForm(requestPasswordReset);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form onSubmit={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">
          Имейл
        </label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={actionPending} pendingText="Изпращане…">Изпрати линк</SubmitButton>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, actionPending] = useKeepForm(updatePassword);
  return (
    <form onSubmit={action} className="space-y-4">
      <PasswordFields newPassword />
      <FormMessage state={state} />
      <SubmitButton pending={actionPending} pendingText="Запазване…">Запази паролата</SubmitButton>
    </form>
  );
}

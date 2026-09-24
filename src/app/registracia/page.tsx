import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { SignUpForm } from "@/components/forms/AuthForms";
import { getMe } from "@/lib/auth";

export const metadata = { title: "Регистрация · Рибново" };

export default async function SignUpPage() {
  if (await getMe()) redirect("/profil");
  return (
    <AuthShell
      title="Регистрация"
      back="/profil"
      intro="Профилът е безплатен. С него публикувате новини, събития и обяви в Рибново."
      footer={
        <>
          Имате профил?{" "}
          <Link href="/vhod" className="font-bold text-forest">
            Влезте
          </Link>
          <span className="mx-2 text-muted">·</span>
          <Link href="/vhod" className="font-bold text-forest">
            Вход с телефон
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}

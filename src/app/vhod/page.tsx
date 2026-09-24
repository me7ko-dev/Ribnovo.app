import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Notice } from "@/components/FormMessage";
import { SignInForm } from "@/components/forms/AuthForms";
import { getMe } from "@/lib/auth";
import { safeNext } from "@/lib/validate";

export const metadata = { title: "Вход · Рибново" };

export default async function SignInPage(props: PageProps<"/vhod">) {
  const params = await props.searchParams;
  const next = safeNext(params.next, "/");
  if (await getMe()) redirect(next);

  return (
    <AuthShell
      title="Вход"
      back="/profil"
      intro="Влезте, за да публикувате, харесвате и коментирате."
      footer={
        <>
          Нямате профил?{" "}
          <Link href="/registracia" className="font-bold text-forest">
            Регистрирайте се
          </Link>
        </>
      }
    >
      {params.greshka === "link" && (
        <div className="mb-4">
          <Notice tone="warn">
            Линкът не сработи или е изтекъл. Ако вече сте потвърдили имейла си, просто влезте.
          </Notice>
        </div>
      )}
      <SignInForm next={next} />
    </AuthShell>
  );
}

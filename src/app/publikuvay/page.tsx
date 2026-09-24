import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Notice } from "@/components/FormMessage";
import { PageHeader } from "@/components/PageHeader";
import { PublishForms, type PublishKind } from "@/components/forms/PublishForms";
import { getMe, isVerified } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { dateKey } from "@/lib/format";

export const metadata = { title: "Публикувай · Рибново" };

const KINDS: PublishKind[] = ["novina", "obyava", "sabitie", "alarma"];

export default async function PublishPage(props: PageProps<"/publikuvay">) {
  const { vid } = await props.searchParams;
  const me = await getMe();

  if (!me) {
    return (
      <AuthShell title="Публикувай" intro="За да публикувате новина, събитие или обява, влезте в профила си.">
        <div className="space-y-3">
          <Link href="/vhod?next=/publikuvay" className="btn-primary w-full">
            Вход
          </Link>
          <Link href="/registracia" className="btn-secondary w-full">
            Регистрация
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (!me.profile.full_name && !me.profile.organization) {
    return (
      <>
        <PageHeader title="Публикувай" />
        <div className="space-y-3 px-4">
          <Notice tone="warn">Преди да публикувате, напишете името си, за да знаят съселяните кой пише.</Notice>
          <Link href="/profil" className="btn-primary w-full">
            Към профила
          </Link>
        </div>
      </>
    );
  }

  const initial = KINDS.includes(vid as PublishKind) ? (vid as PublishKind) : "novina";
  return (
    <>
      <PageHeader title="Публикувай" />
      <div className="px-4">
        {hasSupabase && <PublishForms userId={me.id} canAlert={isVerified(me)} initial={initial} today={dateKey()} />}
      </div>
    </>
  );
}

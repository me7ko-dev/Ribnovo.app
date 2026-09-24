import Link from "next/link";
import { BadgeCheck, Bell, ChevronRight, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { Avatar } from "@/components/Avatar";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { Notice } from "@/components/FormMessage";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getMe, isAdmin } from "@/lib/auth";
import { getMyContent } from "@/lib/data";
import { longDate, timeAgo } from "@/lib/format";
import { displayName } from "@/lib/names";

export const metadata = { title: "Профил · Рибново" };

const ROLE_LABELS = { admin: "Администратор", verified: "Проверен профил", resident: "Жител" };

export default async function ProfilePage(props: PageProps<"/profil">) {
  const params = await props.searchParams;
  const me = await getMe();

  if (!me) {
    return (
      <AuthShell title="Профил" intro="Влезте или си направете профил, за да публикувате, харесвате и коментирате.">
        <div className="space-y-3">
          <Link href="/vhod" className="btn-primary w-full">
            Вход
          </Link>
          <Link href="/registracia" className="btn-secondary w-full">
            Регистрация
          </Link>
        </div>
        <Links />
      </AuthShell>
    );
  }

  const { posts, events } = await getMyContent(me.id);
  const needsName = !me.profile.full_name && !me.profile.organization;
  const items = [
    ...posts.map((p) => ({ id: p.id, href: `/novini/${p.id}`, title: p.title, kind: p.kind === "ad" ? "Обява" : "Новина", status: p.status, when: timeAgo(p.created_at) })),
    ...events.map((e) => ({ id: e.id, href: `/sabitiya/${e.id}`, title: e.title, kind: "Събитие", status: e.status, when: longDate(e.starts_at) })),
  ];

  return (
    <>
      <PageHeader title="Профил" />
      <div className="space-y-4 px-4">
        {params["dobre-doshli"] && <Notice>Добре дошли в Рибново! Профилът ви е готов.</Notice>}
        {params.izprateno && <Notice>Изпратено! Ще се появи, след като администраторът го одобри.</Notice>}
        {params.parola && <Notice>Паролата е сменена.</Notice>}
        {needsName && <Notice tone="warn">Напишете името си, за да можете да публикувате и коментирате.</Notice>}

        <section className="card p-5">
          <div className="flex items-center gap-4">
            <Avatar profile={me.profile} size={64} />
            <div className="min-w-0">
              <p className="truncate font-serif text-xl font-semibold">{displayName(me.profile)}</p>
              <p className="flex items-center gap-1 text-sm font-semibold text-forest">
                {me.profile.role !== "resident" && <BadgeCheck size={16} aria-hidden />}
                {ROLE_LABELS[me.profile.role]}
              </p>
              <p className="truncate text-sm text-muted">{me.email ?? me.phone}</p>
            </div>
          </div>
          <details className="mt-4 border-t border-line pt-4" open={needsName}>
            <summary className="cursor-pointer font-bold text-forest">Редактирай профила</summary>
            <div className="mt-4">
              <ProfileForm userId={me.id} fullName={me.profile.full_name ?? ""} avatarUrl={me.profile.avatar_url} />
            </div>
          </details>
        </section>

        {isAdmin(me) && (
          <Link href="/admin" className="card flex items-center gap-3 p-4">
            <ShieldCheck size={22} className="text-alarm" aria-hidden />
            <span className="flex-1 font-bold">Администрация</span>
            <ChevronRight size={18} className="text-muted" aria-hidden />
          </Link>
        )}

        <section>
          <h2 className="font-serif text-[22px] font-semibold">Моите публикации</h2>
          <ul className="mt-3 space-y-2">
            {items.length === 0 && (
              <li className="text-sm text-muted">
                Още нямате публикации.{" "}
                <Link href="/publikuvay" className="font-bold text-forest">
                  Публикувайте нещо
                </Link>
              </li>
            )}
            {items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="card flex items-center gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.kind} · {item.when}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Links />

        <form action={signOut}>
          <button className="btn-secondary w-full text-alarm">
            <LogOut size={18} aria-hidden /> Изход
          </button>
        </form>
      </div>
    </>
  );
}

function Links() {
  return (
    <div className="card mt-4 divide-y divide-line">
      <Link href="/alarmi#izvestiya" className="flex items-center gap-3 p-4">
        <Bell size={20} className="text-forest" aria-hidden />
        <span className="flex-1 font-semibold">Настройки на известията</span>
        <ChevronRight size={18} className="text-muted" aria-hidden />
      </Link>
      <Link href="/instalirane" className="flex items-center gap-3 p-4">
        <Smartphone size={20} className="text-forest" aria-hidden />
        <span className="flex-1 font-semibold">Как да инсталирам приложението</span>
        <ChevronRight size={18} className="text-muted" aria-hidden />
      </Link>
    </div>
  );
}

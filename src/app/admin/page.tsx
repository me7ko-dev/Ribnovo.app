import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ExternalLink, EyeOff, Search, X } from "lucide-react";
import { moderate, resolveReport } from "@/app/actions/admin";
import { AuthorLine } from "@/components/AuthorLine";
import { Avatar } from "@/components/Avatar";
import { RoleForm } from "@/components/forms/RoleForm";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { SubmitButton } from "@/components/SubmitButton";
import { getOpenReports, getPending, getPeople } from "@/lib/admin-data";
import { isAdmin, requireMe } from "@/lib/auth";
import { longDate, time, timeAgo } from "@/lib/format";
import { displayName } from "@/lib/names";
import type { Author } from "@/lib/types";

export const metadata = { title: "Администрация · Рибново" };

const TABS = [
  { key: "chakashti", label: "Чакащи" },
  { key: "dokladi", label: "Сигнали" },
  { key: "hora", label: "Хора" },
];

export default async function AdminPage(props: PageProps<"/admin">) {
  const me = await requireMe("/admin");
  if (!isAdmin(me)) notFound();
  const params = await props.searchParams;
  const tab = TABS.some((t) => t.key === params.tab) ? String(params.tab) : "chakashti";

  const [pending, reports] = await Promise.all([getPending(), getOpenReports()]);
  const counts: Record<string, number> = {
    chakashti: pending.posts.length + pending.events.length,
    dokladi: reports.length,
  };

  return (
    <>
      <PageHeader title="Администрация" back="/profil" />
      <nav className="mx-4 mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-line/60 p-1" aria-label="Раздели">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={`rounded-xl py-2.5 text-center text-sm font-bold ${tab === t.key ? "bg-paper text-forest shadow-sm" : "text-muted"}`}
          >
            {t.label}
            {counts[t.key] ? <span className="ml-1 rounded-full bg-alarm px-1.5 text-xs text-white">{counts[t.key]}</span> : null}
          </Link>
        ))}
      </nav>

      <div className="space-y-3 px-4">
        {tab === "chakashti" && <PendingList pending={pending} />}
        {tab === "dokladi" && <ReportList reports={reports} />}
        {tab === "hora" && <People search={String(params.q ?? "")} />}
      </div>
    </>
  );
}

function ModerateButtons({ type, id }: { type: "post" | "event"; id: string }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <form action={moderate}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="approve" />
        <SubmitButton className="btn-primary w-full py-2.5">
          <Check size={18} aria-hidden /> Одобри
        </SubmitButton>
      </form>
      <form action={moderate}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="reject" />
        <SubmitButton className="btn-secondary w-full py-2.5 text-alarm">
          <X size={18} aria-hidden /> Отхвърли
        </SubmitButton>
      </form>
    </div>
  );
}

function Byline({ author, when }: { author: Author | null; when: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Avatar profile={author} size={28} />
      <AuthorLine author={author} className="font-bold" />
      <span className="text-muted">· {timeAgo(when)}</span>
    </div>
  );
}

function PendingList({ pending }: { pending: Awaited<ReturnType<typeof getPending>> }) {
  if (pending.posts.length + pending.events.length === 0) {
    return <p className="text-center text-muted">Няма нищо за одобрение. 🎉</p>;
  }
  return (
    <>
      {pending.posts.map((p) => (
        <article key={p.id} className="card p-4">
          <Byline author={p.author} when={p.created_at} />
          <p className="mt-2 text-xs font-bold text-muted uppercase">{p.kind === "ad" ? "Обява" : "Новина"}</p>
          <h3 className="font-serif text-lg font-semibold">{p.title}</h3>
          <p className="mt-1 text-[15px] whitespace-pre-line text-ink/80">{p.body}</p>
          {p.image_url && <Photo src={p.image_url} className="mt-3 max-h-64 rounded-2xl" />}
          <ModerateButtons type="post" id={p.id} />
        </article>
      ))}
      {pending.events.map((e) => (
        <article key={e.id} className="card p-4">
          <Byline author={e.author} when={e.created_at} />
          <p className="mt-2 text-xs font-bold text-muted uppercase">{e.category === "memorial" ? "Възпоменание" : "Събитие"}</p>
          <h3 className="font-serif text-lg font-semibold">{e.title}</h3>
          <p className="text-sm font-semibold text-forest">
            {longDate(e.starts_at)}, {time(e.starts_at)}
            {e.location && ` · ${e.location}`}
          </p>
          {e.description && <p className="mt-1 text-[15px] whitespace-pre-line text-ink/80">{e.description}</p>}
          {e.image_url && <Photo src={e.image_url} className="mt-3 max-h-64 rounded-2xl" />}
          <ModerateButtons type="event" id={e.id} />
        </article>
      ))}
    </>
  );
}

const TARGET_LABELS = { post: "Публикация", event: "Събитие", alert: "Аларма", comment: "Коментар" };

function ReportList({ reports }: { reports: Awaited<ReturnType<typeof getOpenReports>> }) {
  if (reports.length === 0) return <p className="text-center text-muted">Няма нови сигнали.</p>;
  return (
    <>
      {reports.map((r) => (
        <article key={r.id} className="card p-4">
          <p className="text-xs font-bold text-muted uppercase">
            {TARGET_LABELS[r.target_type]} · {timeAgo(r.created_at)}
          </p>
          <p className="mt-1 font-semibold">{r.preview}</p>
          {r.href && (
            <Link href={r.href} className="inline-flex items-center gap-1 text-sm font-bold text-forest">
              Отвори <ExternalLink size={14} aria-hidden />
            </Link>
          )}
          <p className="mt-2 rounded-2xl bg-alarm-soft px-3 py-2 text-sm text-alarm">
            <b>{r.reason}</b> — сигнал от {displayName(r.reporter)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <form action={resolveReport}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="hide" value="1" />
              <SubmitButton className="btn-alarm w-full py-2.5">
                <EyeOff size={18} aria-hidden /> Скрий
              </SubmitButton>
            </form>
            <form action={resolveReport}>
              <input type="hidden" name="id" value={r.id} />
              <SubmitButton className="btn-secondary w-full py-2.5">Остави</SubmitButton>
            </form>
          </div>
        </article>
      ))}
    </>
  );
}

async function People({ search }: { search: string }) {
  const people = await getPeople(search);
  return (
    <>
      <form className="relative" role="search">
        <input type="hidden" name="tab" value="hora" />
        <Search size={18} className="absolute top-3.5 left-4 text-muted" aria-hidden />
        <input name="q" defaultValue={search} placeholder="Търси по име" aria-label="Търси по име" className="input pl-11" />
      </form>
      <p className="text-xs text-muted">
        <b>Проверен профил</b> (кметство, училище) пуска аларми и публикува без одобрение. <b>Администратор</b> одобрява и
        дава права.
      </p>
      {people.map((p) => (
        <article key={p.id} className="card p-4">
          <div className="flex items-center gap-3">
            <Avatar profile={p} size={40} />
            <div className="min-w-0">
              <AuthorLine author={p} className="font-bold" />
              <p className="truncate text-xs text-muted">
                {p.contact ?? "без име/контакт"} · от {timeAgo(p.created_at)}
              </p>
            </div>
          </div>
          <RoleForm userId={p.id} role={p.role} organization={p.organization} />
        </article>
      ))}
    </>
  );
}

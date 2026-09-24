import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/actions/content";
import { AuthorLine } from "@/components/AuthorLine";
import { Avatar } from "@/components/Avatar";
import { Notice } from "@/components/FormMessage";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { ReportButton } from "@/components/ReportButton";
import { getMe, isAdmin } from "@/lib/auth";
import { getEvent } from "@/lib/data";
import { dayLabel, longDate, time } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/sabitiya/[id]">) {
  const event = await getEvent((await props.params).id);
  return { title: event ? `${event.title} · Рибново` : "Рибново" };
}

export default async function EventPage(props: PageProps<"/sabitiya/[id]">) {
  const { id } = await props.params;
  const [event, me] = await Promise.all([getEvent(id), getMe()]);
  if (!event) notFound();
  const memorial = event.category === "memorial";
  const canDelete = me && (me.id === event.author_id || isAdmin(me));

  return (
    <>
      <PageHeader title={memorial ? "Възпоменание" : "Събитие"} back="/sabitiya" />
      <div className="space-y-3 px-4">
        {event.status === "pending" && <Notice tone="info">Това събитие чака одобрение от администратора.</Notice>}
        {event.status === "rejected" && <Notice tone="warn">Това събитие е отхвърлено и не се вижда от другите.</Notice>}

        <article className="card overflow-hidden">
          {event.image_url && <Photo src={event.image_url} className="max-h-[60vh]" />}
          <div className="p-5">
            <h1 className="font-serif text-[26px] leading-tight font-semibold">{event.title}</h1>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li className="flex items-center gap-3">
                <CalendarDays size={20} className="shrink-0 text-forest" aria-hidden />
                <span>
                  <b>{dayLabel(event.starts_at)}</b>, {longDate(event.starts_at).replace(/^[^,]+, /, "")}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={20} className="shrink-0 text-forest" aria-hidden />
                {time(event.starts_at)}
                {event.ends_at && ` – ${time(event.ends_at)}`}
              </li>
              {event.location && (
                <li className="flex items-center gap-3">
                  <MapPin size={20} className="shrink-0 text-forest" aria-hidden />
                  {event.location}
                </li>
              )}
            </ul>
            {event.description && (
              <p className="mt-4 border-t border-line pt-4 text-[15px] leading-relaxed whitespace-pre-line">{event.description}</p>
            )}
            {event.author && (
              <Link href={`/profil/${event.author.id}`} className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                <Avatar profile={event.author} size={32} />
                <span className="text-sm text-muted">
                  Добавено от <AuthorLine author={event.author} className="font-bold text-ink" />
                </span>
              </Link>
            )}
          </div>
        </article>

        <div className="flex flex-wrap items-center justify-end gap-1">
          {me && me.id !== event.author_id && <ReportButton targetType="event" targetId={event.id} />}
          {canDelete && (
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={event.id} />
              <button className="btn-small text-alarm hover:bg-alarm-soft">
                <Trash2 size={17} aria-hidden /> Изтрий
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

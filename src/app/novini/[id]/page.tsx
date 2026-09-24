import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteComment, deletePost } from "@/app/actions/content";
import { AuthorLine } from "@/components/AuthorLine";
import { Avatar } from "@/components/Avatar";
import { CommentForm } from "@/components/forms/CommentForm";
import { Notice } from "@/components/FormMessage";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { ReportButton } from "@/components/ReportButton";
import { getMe, isAdmin } from "@/lib/auth";
import { getPost } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/novini/[id]">) {
  const data = await getPost((await props.params).id);
  return { title: data ? `${data.post.title} · Рибново` : "Рибново" };
}

export default async function PostPage(props: PageProps<"/novini/[id]">) {
  const { id } = await props.params;
  const [data, me] = await Promise.all([getPost(id), getMe()]);
  if (!data) notFound();
  const { post, comments } = data;
  const canDelete = me && (me.id === post.author_id || isAdmin(me));

  return (
    <>
      <PageHeader title={post.kind === "ad" ? "Обява" : "Новина"} back="/novini" />
      <div className="space-y-3 px-4">
        {post.status === "pending" && <Notice tone="info">Тази публикация чака одобрение от администратора.</Notice>}
        {post.status === "rejected" && <Notice tone="warn">Тази публикация е отхвърлена и не се вижда от другите.</Notice>}

        <PostCard post={post} signedIn={Boolean(me)} full />

        <div className="flex flex-wrap items-center justify-end gap-1">
          {me && me.id !== post.author_id && <ReportButton targetType="post" targetId={post.id} />}
          {canDelete && (
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <button className="btn-small text-alarm hover:bg-alarm-soft">
                <Trash2 size={17} aria-hidden /> Изтрий
              </button>
            </form>
          )}
        </div>

        {post.status === "approved" && (
          <section id="komentari" aria-labelledby="komentari-title" className="scroll-mt-4 pt-2">
            <h2 id="komentari-title" className="font-serif text-xl font-semibold">
              Коментари {comments.length > 0 && <span className="text-muted">({comments.length})</span>}
            </h2>
            <ul className="mt-3 space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Link href={`/profil/${c.author_id}`}>
                    <Avatar profile={c.author} size={34} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl rounded-tl-md bg-paper px-3.5 py-2.5 ring-1 ring-line">
                      <Link href={`/profil/${c.author_id}`}>
                        <AuthorLine author={c.author} className="text-sm font-bold" />
                      </Link>
                      <p className="text-[15px] leading-snug whitespace-pre-line">{c.body}</p>
                    </div>
                    <div className="flex items-center gap-1 pl-2 text-xs text-muted">
                      {timeAgo(c.created_at)}
                      {me && me.id !== c.author_id && <ReportButton targetType="comment" targetId={c.id} compact />}
                      {me && (me.id === c.author_id || isAdmin(me)) && (
                        <form action={deleteComment}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="btn-small px-2 py-1 text-xs text-muted">Изтрий</button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted">Бъдете първи, който коментира.</p>}
            </ul>
            <div className="mt-4">
              {me ? (
                <CommentForm postId={post.id} />
              ) : (
                <Link href={`/vhod?next=/novini/${post.id}`} className="btn-secondary w-full">
                  Влезте, за да коментирате
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

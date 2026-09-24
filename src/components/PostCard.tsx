import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { timeAgo } from "@/lib/format";
import type { Post } from "@/lib/types";
import { AuthorLine } from "./AuthorLine";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import { Photo } from "./Photo";

// Публикация в новините — като във Facebook: автор, текст, снимка, харесвания, коментари
export function PostCard({ post, signedIn, full = false }: { post: Post; signedIn: boolean; full?: boolean }) {
  const ad = post.kind === "ad";
  const href = `/novini/${post.id}`;
  const TitleTag = full ? "h1" : "h3";
  return (
    <article className="card overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4">
        {post.author ? (
          <Link href={`/profil/${post.author.id}`} className="shrink-0">
            <Avatar profile={post.author} size={42} />
          </Link>
        ) : (
          <Avatar profile={{ id: "ribnovo", full_name: "Рибново", organization: null, avatar_url: null }} size={42} />
        )}
        <div className="min-w-0 flex-1 leading-tight">
          {post.author ? (
            <Link href={`/profil/${post.author.id}`} className="block">
              <AuthorLine author={post.author} className="text-[15px] font-bold text-ink" />
            </Link>
          ) : (
            <p className="text-[15px] font-bold text-ink">Рибново</p>
          )}
          <p className="mt-0.5 text-xs text-muted">
            {timeAgo(post.published_at ?? post.created_at)}
            <span className={`ml-2 rounded-full px-2 py-0.5 font-bold ${ad ? "bg-alarm-soft text-alarm" : "bg-forest-soft text-forest"}`}>
              {ad ? "Обява" : "Новина"}
            </span>
          </p>
        </div>
      </div>

      <div className="px-4 pt-3 pb-3">
        <TitleTag className={`font-serif leading-snug font-semibold ${full ? "text-2xl" : "text-lg"}`}>
          {full ? post.title : <Link href={href}>{post.title}</Link>}
        </TitleTag>
        <p className={`mt-1.5 text-[15px] leading-relaxed whitespace-pre-line ${full ? "text-ink" : "line-clamp-4 text-ink/80"}`}>
          {post.body}
        </p>
      </div>

      {post.image_url &&
        (full ? (
          <Photo src={post.image_url} className="max-h-[70vh] object-contain" />
        ) : (
          <Link href={href}>
            <Photo src={post.image_url} className="aspect-[4/3]" />
          </Link>
        ))}

      {post.status === "approved" && (
        <div className="flex items-center gap-1 border-t border-line px-2 py-1.5">
          <LikeButton postId={post.id} liked={Boolean(post.liked_by_me)} count={post.like_count} signedIn={signedIn} />
          <Link href={`${href}#komentari`} className="btn-small text-muted hover:bg-cream">
            <MessageCircle size={19} aria-hidden />
            {post.comment_count === 0 ? "Коментирай" : `${post.comment_count} ${post.comment_count === 1 ? "коментар" : "коментара"}`}
          </Link>
        </div>
      )}
    </article>
  );
}

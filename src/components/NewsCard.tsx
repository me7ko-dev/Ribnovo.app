import { timeAgo } from "@/lib/format";
import type { Post } from "@/lib/types";
import { AuthorLine } from "./AuthorLine";

export function NewsCard({ post }: { post: Post }) {
  const ad = post.kind === "ad";
  return (
    <article className="rounded-3xl border border-line bg-paper p-4">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2.5 py-1 font-bold ${
            ad ? "bg-alarm-soft text-alarm" : "bg-forest-soft text-forest"
          }`}
        >
          {ad ? "Обява" : "Новина"}
        </span>
        <span className="text-muted">{timeAgo(post.published_at)}</span>
      </div>
      <h3 className="mt-2.5 font-serif text-lg leading-snug font-semibold">{post.title}</h3>
      <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed text-muted">{post.body}</p>
      <AuthorLine author={post.author} className="mt-3 text-sm font-semibold text-forest" />
    </article>
  );
}

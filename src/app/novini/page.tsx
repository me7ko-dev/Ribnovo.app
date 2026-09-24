import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { getMe } from "@/lib/auth";
import { getFeedPage } from "@/lib/data";

export const metadata = { title: "Новини · Рибново" };

export default async function NewsPage(props: PageProps<"/novini">) {
  const { str } = await props.searchParams;
  const page = Math.max(1, Number(str) || 1);
  const [{ posts, hasMore }, me] = await Promise.all([getFeedPage(page), getMe()]);

  return (
    <>
      <PageHeader
        title="Новини"
        back="/"
        action={
          <Link href="/publikuvay" className="btn-small bg-forest text-cream">
            <Plus size={17} aria-hidden /> Публикувай
          </Link>
        }
      />
      <div className="space-y-3 px-4">
        {posts.length === 0 && <p className="text-muted">Все още няма новини.</p>}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} signedIn={Boolean(me)} />
        ))}
        <nav className="flex justify-between gap-3 pt-2" aria-label="Страници">
          {page > 1 ? (
            <Link href={page === 2 ? "/novini" : `/novini?str=${page - 1}`} className="btn-secondary">
              ← По-нови
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link href={`/novini?str=${page + 1}`} className="btn-secondary">
              По-стари →
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}

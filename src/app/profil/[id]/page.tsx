import { notFound, redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { getMe } from "@/lib/auth";
import { getPublicProfile } from "@/lib/data";
import { displayName } from "@/lib/names";

export default async function PublicProfilePage(props: PageProps<"/profil/[id]">) {
  const { id } = await props.params;
  const [data, me] = await Promise.all([getPublicProfile(id), getMe()]);
  if (!data) notFound();
  if (me?.id === id) redirect("/profil");
  const { profile, posts } = data;

  return (
    <>
      <PageHeader title="Профил" back="/" />
      <div className="space-y-4 px-4">
        <section className="card flex items-center gap-4 p-5">
          <Avatar profile={profile} size={64} />
          <div className="min-w-0">
            <h1 className="truncate font-serif text-xl font-semibold">{displayName(profile)}</h1>
            {profile.role !== "resident" && (
              <p className="flex items-center gap-1 text-sm font-semibold text-forest">
                <BadgeCheck size={16} aria-hidden /> Проверен профил
              </p>
            )}
            {profile.organization && profile.full_name && <p className="text-sm text-muted">{profile.full_name}</p>}
          </div>
        </section>
        <h2 className="font-serif text-[22px] font-semibold">Публикации</h2>
        {posts.length === 0 && <p className="text-sm text-muted">Няма публикации.</p>}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} signedIn={Boolean(me)} />
        ))}
      </div>
    </>
  );
}

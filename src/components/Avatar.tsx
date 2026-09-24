import type { Profile } from "@/lib/types";
import { displayName } from "@/lib/names";

const COLORS = ["#1F4D3A", "#6B4E2E", "#2F5D7C", "#7A3B52", "#5A6B2E", "#8A5A1F"];

// Кръгла снимка на профила или първата буква от името
export function Avatar({ profile, size = 40 }: { profile: Pick<Profile, "full_name" | "organization" | "avatar_url" | "id"> | null; size?: number }) {
  const name = displayName(profile);
  if (profile?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const color = COLORS[[...(profile?.id ?? name)].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-serif font-semibold text-cream"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

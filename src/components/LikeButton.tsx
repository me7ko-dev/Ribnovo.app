"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toggleLike } from "@/app/actions/content";

export function LikeButton({
  postId,
  liked,
  count,
  signedIn,
}: {
  postId: string;
  liked: boolean;
  count: number;
  signedIn: boolean;
}) {
  const [state, setState] = useOptimistic({ liked, count });
  const [, startTransition] = useTransition();

  const label = state.count > 0 ? String(state.count) : "";
  const className = `btn-small ${state.liked ? "text-alarm" : "text-muted"} hover:bg-cream`;

  if (!signedIn) {
    return (
      <Link href="/vhod" className={className} aria-label="Влезте, за да харесате">
        <Heart size={19} aria-hidden />
        Харесвам {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={state.liked}
      className={className}
      onClick={() =>
        startTransition(async () => {
          const next = !state.liked;
          setState({ liked: next, count: state.count + (next ? 1 : -1) });
          await toggleLike(postId, next);
        })
      }
    >
      <Heart size={19} aria-hidden fill={state.liked ? "currentColor" : "none"} />
      Харесвам {label}
    </button>
  );
}

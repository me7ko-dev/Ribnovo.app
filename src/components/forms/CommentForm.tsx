"use client";

import { SendHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";
import { addComment } from "@/app/actions/content";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";
import { useKeepForm } from "./useKeepForm";

export function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useKeepForm(addComment);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} onSubmit={action} className="space-y-2">
      <input type="hidden" name="post_id" value={postId} />
      <div className="flex items-end gap-2">
        <label htmlFor="comment" className="sr-only">
          Коментар
        </label>
        <textarea id="comment" name="body" rows={2} maxLength={1000} required placeholder="Напишете коментар…" className="input resize-none" />
        <SubmitButton pending={pending} className="btn-primary h-12 w-12 shrink-0 !p-0">
          <SendHorizontal size={20} aria-label="Изпрати" />
        </SubmitButton>
      </div>
      {state?.error && <FormMessage state={state} />}
    </form>
  );
}

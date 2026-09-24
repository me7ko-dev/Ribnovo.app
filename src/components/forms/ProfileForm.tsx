"use client";

import { updateProfile } from "@/app/actions/auth";
import { FormMessage } from "../FormMessage";
import { ImageUpload } from "../ImageUpload";
import { SubmitButton } from "../SubmitButton";
import { useKeepForm } from "./useKeepForm";

export function ProfileForm({ userId, fullName, avatarUrl }: { userId: string; fullName: string; avatarUrl: string | null }) {
  const [state, action, pending] = useKeepForm(updateProfile);
  return (
    <form onSubmit={action} className="space-y-4">
      <div>
        <span className="label">Снимка</span>
        <ImageUpload userId={userId} initialUrl={avatarUrl} maxSide={400} label="Добави снимка на профила" round />
      </div>
      <div>
        <label htmlFor="full_name" className="label">
          Име и фамилия
        </label>
        <input id="full_name" name="full_name" defaultValue={fullName} required minLength={2} maxLength={60} autoComplete="name" className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingText="Запазване…">Запази</SubmitButton>
    </form>
  );
}

"use client";

import { useState } from "react";
import { setRole } from "@/app/actions/admin";
import type { UserRole } from "@/lib/types";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";
import { useKeepForm } from "./useKeepForm";

export function RoleForm({ userId, role, organization }: { userId: string; role: UserRole; organization: string | null }) {
  const [state, action, pending] = useKeepForm(setRole);
  const [selected, setSelected] = useState(role);
  return (
    <form onSubmit={action} className="mt-3 space-y-2">
      <input type="hidden" name="user_id" value={userId} />
      <div className="flex gap-2">
        <select name="role" value={selected} onChange={(e) => setSelected(e.target.value as UserRole)} className="input py-2" aria-label="Роля">
          <option value="resident">Жител</option>
          <option value="verified">Проверен профил</option>
          <option value="admin">Администратор</option>
        </select>
        <SubmitButton pending={pending} className="btn-small shrink-0 bg-forest px-4 text-cream">Запази</SubmitButton>
      </div>
      {selected !== "resident" && (
        <input
          name="organization"
          defaultValue={organization ?? ""}
          maxLength={80}
          placeholder="Организация, напр. Кметство Рибново (по желание)"
          aria-label="Организация"
          className="input py-2"
        />
      )}
      <FormMessage state={state} />
    </form>
  );
}

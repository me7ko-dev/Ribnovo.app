import { AuthShell } from "@/components/AuthShell";
import { NewPasswordForm } from "@/components/forms/AuthForms";
import { requireMe } from "@/lib/auth";

export const metadata = { title: "Нова парола · Рибново" };

export default async function NewPasswordPage() {
  await requireMe("/nova-parola");
  return (
    <AuthShell title="Нова парола" intro="Изберете нова парола за профила си.">
      <NewPasswordForm />
    </AuthShell>
  );
}

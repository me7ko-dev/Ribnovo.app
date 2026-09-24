import { AuthShell } from "@/components/AuthShell";
import { ResetRequestForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Забравена парола · Рибново" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Нова парола" back="/vhod" intro="Напишете имейла си и ще ви изпратим линк за нова парола.">
      <ResetRequestForm />
    </AuthShell>
  );
}

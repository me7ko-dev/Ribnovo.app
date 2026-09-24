import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Профил · Рибново" };

export default function ProfilePage() {
  return (
    <ComingSoon title="Профил" phase={2}>
      Тук ще влизате с телефонен номер или имейл. Администраторът ще вижда и публикациите, които чакат
      одобрение.
    </ComingSoon>
  );
}

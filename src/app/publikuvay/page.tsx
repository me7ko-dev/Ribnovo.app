import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Публикувай · Рибново" };

export default function PublishPage() {
  return (
    <ComingSoon title="Публикувай" phase={4}>
      Тук ще можете да публикувате новина, събитие или обява. Публикациите на жителите минават одобрение от
      администратора.
    </ComingSoon>
  );
}

import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Събития · Рибново" };

export default function EventsPage() {
  return (
    <ComingSoon title="Събития" phase={3}>
      Тук ще има седмичен календар и списък с всички събития в селото.
    </ComingSoon>
  );
}

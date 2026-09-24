import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Аларми · Рибново" };

export default function AlarmsPage() {
  return (
    <ComingSoon title="Аларми" phase={3}>
      Тук ще има списък с активни и приключили аларми и превключватели за видовете известия: Спешни (винаги
      включени), Ток и вода, Път и сняг, Събития, Възпоменания, Обяви.
    </ComingSoon>
  );
}

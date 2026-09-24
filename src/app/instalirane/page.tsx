import { EllipsisVertical, Share, SquarePlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Инсталиране · Рибново" };

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-cream">{n}</span>
      <span className="pt-0.5 leading-relaxed">{children}</span>
    </li>
  );
}

// Указания за инсталиране — за споделяне с жителите
export default function InstallHelpPage() {
  return (
    <>
      <PageHeader title="Инсталиране" back="/profil" />
      <div className="space-y-4 px-4">
        <p className="text-[15px] leading-relaxed text-muted">
          Рибново се слага на началния екран като истинско приложение — без магазин за приложения. После получавате
          известия за аларми, дори когато е затворено.
        </p>

        <section className="card p-5">
          <h2 className="font-serif text-xl font-semibold">📱 iPhone</h2>
          <ol className="mt-3 space-y-3">
            <Step n={1}>Отворете сайта в <b>Safari</b>.</Step>
            <Step n={2}>
              Натиснете <Share size={17} className="inline text-forest" aria-label="Сподели" /> <b>Сподели</b> (долу в средата).
            </Step>
            <Step n={3}>
              Изберете <SquarePlus size={17} className="inline text-forest" aria-hidden /> <b>Добави към начален екран</b> → <b>Добави</b>.
            </Step>
            <Step n={4}>
              Отворете Рибново <b>от новата икона</b>, влезте в <b>Аларми</b> и натиснете <b>Включи известията</b>.
            </Step>
          </ol>
          <p className="mt-3 text-xs text-muted">Нужен е iOS 16.4 или по-нов.</p>
        </section>

        <section className="card p-5">
          <h2 className="font-serif text-xl font-semibold">🤖 Android</h2>
          <ol className="mt-3 space-y-3">
            <Step n={1}>Отворете сайта в <b>Chrome</b>.</Step>
            <Step n={2}>
              Натиснете <b>Инсталирай</b> в картата на началния екран, или менюто{" "}
              <EllipsisVertical size={17} className="inline text-forest" aria-label="меню" /> → <b>Инсталиране на приложението</b>.
            </Step>
            <Step n={3}>
              Отворете Рибново, влезте в <b>Аларми</b> и натиснете <b>Включи известията</b> → <b>Разреши</b>.
            </Step>
          </ol>
        </section>
      </div>
    </>
  );
}

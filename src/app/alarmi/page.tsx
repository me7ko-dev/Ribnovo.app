import Link from "next/link";
import { Plus, Sun } from "lucide-react";
import { AlertCard } from "@/components/AlertCard";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NotificationSettings } from "@/components/NotificationSettings";
import { PageHeader } from "@/components/PageHeader";
import { getMe, isAdmin, isVerified } from "@/lib/auth";
import { getAlerts } from "@/lib/data";

export const metadata = { title: "Аларми · Рибново" };

export default async function AlarmsPage() {
  const [{ active, resolved }, me] = await Promise.all([getAlerts(), getMe()]);
  const canResolve = (authorId: string | null) => Boolean(me && (me.id === authorId || isAdmin(me)));

  return (
    <>
      <PageHeader
        title="Аларми"
        action={
          isVerified(me) && (
            <Link href="/publikuvay?vid=alarma" className="btn-small bg-alarm text-white">
              <Plus size={17} aria-hidden /> Нова аларма
            </Link>
          )
        }
      />
      <InstallPrompt />
      <div className="space-y-8 px-4">
        <section aria-labelledby="active-title">
          <h2 id="active-title" className="font-serif text-[22px] font-semibold">
            Активни {active.length > 0 && <span className="text-alarm">({active.length})</span>}
          </h2>
          <div className="mt-3 space-y-3">
            {active.length === 0 && (
              <div className="flex items-center gap-3 rounded-3xl bg-forest-soft px-4 py-3.5 text-forest">
                <Sun size={20} aria-hidden />
                <p className="text-sm font-semibold">Няма активни аларми.</p>
              </div>
            )}
            {active.map((a) => (
              <AlertCard key={a.id} alert={a} canResolve={canResolve(a.author_id)} />
            ))}
          </div>
        </section>

        <NotificationSettings />

        {resolved.length > 0 && (
          <section aria-labelledby="resolved-title">
            <h2 id="resolved-title" className="font-serif text-[22px] font-semibold">
              Приключили
            </h2>
            <div className="mt-3 space-y-3">
              {resolved.map((a) => (
                <AlertCard key={a.id} alert={a} canResolve={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

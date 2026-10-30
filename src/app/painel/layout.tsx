import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireWedding } from "@/server/auth/current";
import { PanelNav } from "@/components/panel/PanelNav";
import { db } from "@/server/db";
import { daysUntil, formatDateLong } from "@/lib/dates";
import { buttonClass } from "@/components/ui";
import { logout } from "@/app/(auth)/actions";

// Shell do painel no modelo da Nautica: menu lateral fixo de 248px, barra
// superior com o nome da tela e conteudo ocupando a largura toda (sem centralizar).
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { wedding, user } = await requireWedding();
  const firstEvent = await db.event.findFirst({ where: { weddingId: wedding.id }, orderBy: [{ startsAt: "asc" }], select: { startsAt: true } });
  const days = firstEvent ? daysUntil(firstEvent.startsAt) : null;
  const initials = wedding.coupleNames
    .split(/\s*(?:&|\se\s)\s*/i)
    .map((n) => n.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start">
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex min-h-13 items-center justify-between gap-3 border-line px-5 lg:border-b">
          <Link href="/painel" className="font-serif text-xl leading-none text-brand">
            Meu Casamento
          </Link>
          <form action={logout} className="lg:hidden">
            <button className="t-action cursor-pointer text-muted hover:text-ink">Sair</button>
          </form>
        </div>
        <PanelNav />
        <div className="hidden border-t border-line p-3 lg:block">
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <span className="t-chip flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand" aria-hidden>
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="t-item truncate">{wedding.coupleNames}</p>
              <p className="t-meta truncate">{user.email}</p>
            </div>
          </div>
          <form action={logout}>
            <button className="t-action mt-1 w-full cursor-pointer rounded-lg px-2 py-1.5 text-left text-muted hover:bg-canvas hover:text-ink">
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 hidden min-h-13 items-center justify-between gap-3 border-b border-line bg-surface/95 px-8 backdrop-blur lg:flex">
          <p className="t-body min-w-0 truncate">
            <span className="t-item">{wedding.coupleNames}</span>
            {firstEvent && (
              <span className="text-muted">
                {" · "}
                {formatDateLong(firstEvent.startsAt)}
                {days !== null && days >= 0 && ` · faltam ${days} ${days === 1 ? "dia" : "dias"}`}
              </span>
            )}
          </p>
          <Link href={`/${wedding.slug}`} target="_blank" className={buttonClass("ghost", undefined, "sm")}>
            Ver meu site <ExternalLink aria-hidden />
          </Link>
        </header>
        <main className="w-full max-w-[1920px] px-4 pt-5 pb-24 sm:px-8 sm:pt-7 sm:pb-14">{children}</main>
      </div>
    </div>
  );
}

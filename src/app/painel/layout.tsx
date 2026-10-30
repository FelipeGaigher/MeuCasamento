import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireWedding } from "@/server/auth/current";
import { PanelNav } from "@/components/panel/PanelNav";
import { logout } from "@/app/(auth)/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { wedding, user } = await requireWedding();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-surface p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
        <div className="mb-4 flex items-center justify-between lg:block">
          <Link href="/painel" className="block">
            <p className="font-serif text-2xl leading-none text-brand">Meu Casamento</p>
            <p className="t-meta mt-1 truncate">{wedding.coupleNames}</p>
          </Link>
          <Link
            href={`/${wedding.slug}`}
            target="_blank"
            className="t-label mt-0 inline-flex items-center gap-1.5 text-brand lg:mt-3"
          >
            Ver meu site <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>
        <PanelNav />
        <form action={logout} className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 lg:mt-4 lg:block lg:pt-4">
          <p className="t-meta truncate">{user.email}</p>
          <button className="t-label shrink-0 text-muted hover:text-ink lg:mt-1">Sair</button>
        </form>
      </aside>
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">{children}</main>
    </div>
  );
}

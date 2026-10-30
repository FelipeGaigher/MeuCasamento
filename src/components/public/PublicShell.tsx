import Link from "next/link";

// Moldura das paginas publicas desta frente (presentes, pedido, link do convidado).
export function PublicShell({
  slug,
  coupleNames,
  vars,
  children,
}: {
  slug: string;
  coupleNames: string;
  vars: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <div style={vars as React.CSSProperties} className="min-h-dvh bg-[var(--w-bg)] text-[var(--w-ink)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link href={`/${slug}`} className="[font-family:var(--w-script)] text-3xl text-[var(--w-accent)]">
          {coupleNames}
        </Link>
        <Link href={`/${slug}`} className="[font-family:var(--w-body)] text-base text-[var(--w-muted)] underline-offset-4 hover:underline">
          Voltar ao site
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24">{children}</main>
    </div>
  );
}

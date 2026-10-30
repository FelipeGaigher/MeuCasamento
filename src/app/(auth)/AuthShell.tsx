import Link from "next/link";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-serif text-2xl text-brand">Meu Casamento</Link>
        <h1 className="mt-8 font-serif text-4xl text-ink">{title}</h1>
        <p className="t-body mt-2 text-muted">{subtitle}</p>
        <div className="mt-8 rounded-xl border border-line bg-surface p-5 sm:p-8">{children}</div>
        <p className="t-body mt-6 text-muted">{footer}</p>
      </div>
    </div>
  );
}

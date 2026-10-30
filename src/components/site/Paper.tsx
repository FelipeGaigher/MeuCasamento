import { cn } from "@/lib/cn";

// Folha de papel: borda levemente irregular, filete interno e sombra suave.
// O texto sempre fica sobre o papel, nunca sobre a arte.
export function Paper({
  children,
  className,
  tone = "paper",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "accent";
}) {
  const accent = tone === "accent";
  return (
    <div
      className={cn("relative", className)}
      style={{
        background: accent ? "var(--w-accent)" : "var(--w-paper)",
        color: accent ? "var(--w-accent-ink)" : "var(--w-ink)",
        borderRadius: "18px 14px 20px 12px / 12px 20px 14px 18px",
        boxShadow:
          "0 1px 0 rgba(255,255,255,.6) inset, 0 18px 40px -24px rgba(40,20,20,.45), 0 2px 6px -2px rgba(40,20,20,.18)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2.5"
        style={{
          border: `1px solid ${accent ? "color-mix(in srgb, var(--w-accent-ink) 35%, transparent)" : "var(--w-line)"}`,
          borderRadius: "14px 10px 16px 9px / 9px 16px 10px 14px",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// Etiqueta de papel recortado: o botao principal do convite (link real).
export function TagLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center px-8 py-4 text-center transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
      style={{
        background: "var(--w-accent)",
        color: "var(--w-accent-ink)",
        fontFamily: "var(--w-display)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontSize: "1.0625rem",
        fontWeight: 600,
        clipPath: "polygon(4% 0, 96% 2%, 100% 50%, 97% 100%, 3% 98%, 0 50%)",
        boxShadow: "0 10px 24px -14px rgba(60,10,20,.6)",
        minHeight: 56,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-[5px]"
        style={{
          border: "1px dashed color-mix(in srgb, var(--w-accent-ink) 55%, transparent)",
          clipPath: "polygon(4% 0, 96% 2%, 100% 50%, 97% 100%, 3% 98%, 0 50%)",
        }}
      />
      <span className="relative">{children}</span>
    </a>
  );
}

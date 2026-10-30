import type { Collection } from "@/collections";
import { themeVars } from "@/collections";

// Mini cartao de colecao para a LP e para a escolha no cadastro.
// Desenha so com as variaveis --w-* do tema; o texto e texto de verdade.
export function CollectionCard({ collection, names = "Ana & Pedro" }: { collection: Collection; names?: string }) {
  return (
    <div
      style={{ ...themeVars(collection.key), containerType: "inline-size" } as React.CSSProperties}
      className="relative overflow-hidden rounded-xl p-3"
    >
      <div className="absolute inset-0" style={{ background: "var(--w-bg)" }} aria-hidden />
      <div
        className="relative flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg px-4 text-center"
        style={{ background: "var(--w-paper)", color: "var(--w-ink)", boxShadow: "0 1px 0 var(--w-line), 0 10px 30px -18px rgba(0,0,0,.35)" }}
      >
        <span aria-hidden className="absolute inset-2 rounded-md border" style={{ borderColor: "var(--w-line)" }} />
        <Sprig />
        <span style={{ fontFamily: "var(--w-display)", letterSpacing: "0.22em", color: "var(--w-muted)", fontSize: "max(10px, 5.5cqw)" }} className="uppercase">
          Casamento
        </span>
        <span style={{ fontFamily: "var(--w-script)", color: "var(--w-accent)", fontSize: "12cqw", lineHeight: 1.1 }}>{names}</span>
        <span style={{ fontFamily: "var(--w-display)", fontSize: "7.5cqw" }}>13.12.2026</span>
        <span
          className="mt-2 rounded-md px-3 py-1 whitespace-nowrap"
          style={{ background: "var(--w-accent)", color: "var(--w-accent-ink)", fontFamily: "var(--w-display)", letterSpacing: "0.08em", fontSize: "max(10px, 5cqw)" }}
        >
          CONFIRMAR
        </span>
      </div>
    </div>
  );
}

function Sprig() {
  return (
    <svg viewBox="0 0 64 24" className="h-5 w-14" aria-hidden>
      <path d="M4 18 C 20 6, 44 6, 60 18" fill="none" stroke="var(--w-leaf)" strokeWidth="1.2" />
      <ellipse cx="18" cy="11" rx="4" ry="2" fill="var(--w-leaf)" transform="rotate(-30 18 11)" />
      <ellipse cx="46" cy="11" rx="4" ry="2" fill="var(--w-leaf)" transform="rotate(30 46 11)" />
      <circle cx="32" cy="9" r="3" fill="var(--w-accent)" />
    </svg>
  );
}

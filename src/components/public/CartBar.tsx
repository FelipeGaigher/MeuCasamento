"use client";

import Link from "next/link";
import { formatBRL } from "@/lib/money";
import { useCart } from "./cart";

// Barra fixa no rodape quando ha itens no carrinho.
export function CartBar({ slug }: { slug: string }) {
  const { count, totalCents } = useCart(slug);
  if (count === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--w-line)] bg-[var(--w-paper)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <p className="[font-family:var(--w-body)] text-base text-[var(--w-ink)]">
          {count} {count === 1 ? "presente" : "presentes"} · <strong>{formatBRL(totalCents)}</strong>
        </p>
        <Link
          href={`/${slug}/presentes/finalizar`}
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--w-accent)] px-5 text-base text-[var(--w-accent-ink)] [font-family:var(--w-body)]"
        >
          Finalizar presente
        </Link>
      </div>
    </div>
  );
}

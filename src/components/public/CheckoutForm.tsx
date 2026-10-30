"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatBRL } from "@/lib/money";
import { useCart } from "./cart";
import { pub } from "./styles";

export function CheckoutForm({ slug }: { slug: string }) {
  const router = useRouter();
  const { items, setQuantity, clear, totalCents } = useCart(slug);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className={`${pub.paper} p-8 text-center`}>
        <p className={pub.body}>Seu carrinho está vazio.</p>
        <Link href={`/${slug}/presentes`} className={`${pub.button} mt-4`}>
          Escolher um presente
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    const res = await fetch(`/api/public/${slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: items.map((i) => ({ giftId: i.giftId, quantity: i.quantity })),
        buyerName: form.get("buyerName"),
        buyerEmail: form.get("buyerEmail"),
        buyerCpf: form.get("buyerCpf") || "",
        message: form.get("message") || "",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSending(false);
      return setError(data.error ?? "Não foi possível criar o pedido. Tente de novo.");
    }
    clear();
    router.push(`/${slug}/pedido/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <ul className={`${pub.paper} divide-y divide-[var(--w-line)]`}>
        {items.map((i) => (
          <li key={i.giftId} className="flex items-center gap-4 p-4">
            {i.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.imageUrl} alt="" className="size-14 rounded-lg object-cover" />
            ) : (
              <div className="size-14 rounded-lg bg-[var(--w-bg)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`${pub.body} truncate`}>{i.title}</p>
              <p className={pub.muted}>{formatBRL(i.priceCents)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Diminuir" className="size-9 rounded-full border border-[var(--w-line)] text-lg" onClick={() => setQuantity(i.giftId, i.quantity - 1)}>
                −
              </button>
              <span className={`${pub.body} w-6 text-center`}>{i.quantity}</span>
              <button type="button" aria-label="Aumentar" className="size-9 rounded-full border border-[var(--w-line)] text-lg" onClick={() => setQuantity(i.giftId, i.quantity + 1)}>
                +
              </button>
            </div>
          </li>
        ))}
        <li className="flex items-center justify-between p-4">
          <span className={pub.body}>Total</span>
          <span className="[font-family:var(--w-display)] text-2xl text-[var(--w-accent)]">{formatBRL(totalCents)}</span>
        </li>
      </ul>

      <div className={`${pub.paper} grid grid-cols-1 gap-4 p-6 sm:grid-cols-2`}>
        <label className="flex flex-col gap-1.5">
          <span className={pub.label}>Seu nome</span>
          <input name="buyerName" required minLength={2} className={pub.input} autoComplete="name" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={pub.label}>Seu e-mail</span>
          <input name="buyerEmail" type="email" required className={pub.input} autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={pub.label}>Recado para o casal (opcional)</span>
          <textarea name="message" rows={3} maxLength={500} className={pub.input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={pub.label}>CPF (opcional)</span>
          <input name="buyerCpf" inputMode="numeric" className={pub.input} placeholder="000.000.000-00" />
        </label>
      </div>

      {error && <p className="text-center text-base text-[var(--w-accent)]">{error}</p>}
      <button type="submit" disabled={sending} className={pub.button}>
        {sending ? "Gerando o Pix..." : `Pagar ${formatBRL(totalCents)} com Pix`}
      </button>
    </form>
  );
}

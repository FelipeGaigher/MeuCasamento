"use client";

import { useCallback, useSyncExternalStore } from "react";

// Carrinho do convidado: so no navegador, por casamento. O servidor recalcula
// tudo no pedido; titulo e preco aqui servem apenas para exibir.

export type CartItem = { giftId: string; title: string; priceCents: number; imageUrl: string | null; quantity: number };

const key = (slug: string) => `mc-cart:${slug}`;
const EVENT = "mc-cart-change";
const EMPTY: CartItem[] = [];
const snapshots = new Map<string, { raw: string | null; items: CartItem[] }>();

function read(slug: string): CartItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(slug));
  } catch {
    return EMPTY;
  }
  const cached = snapshots.get(slug);
  if (cached && cached.raw === raw) return cached.items;
  let items: CartItem[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed.filter((i) => i && typeof i.giftId === "string" && i.quantity > 0);
  } catch {}
  snapshots.set(slug, { raw, items });
  return items;
}

function write(slug: string, items: CartItem[]) {
  try {
    localStorage.setItem(key(slug), JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCart(slug: string) {
  const items = useSyncExternalStore(subscribe, () => read(slug), () => EMPTY);
  const add = useCallback(
    (item: Omit<CartItem, "quantity">, max?: number | null) => {
      const current = read(slug);
      const found = current.find((i) => i.giftId === item.giftId);
      const next = found
        ? current.map((i) => (i.giftId === item.giftId ? { ...i, quantity: Math.min(i.quantity + 1, max ?? 20) } : i))
        : [...current, { ...item, quantity: 1 }];
      write(slug, next);
    },
    [slug],
  );
  const setQuantity = useCallback(
    (giftId: string, quantity: number) => {
      const next = read(slug)
        .map((i) => (i.giftId === giftId ? { ...i, quantity: Math.max(0, Math.min(quantity, 20)) } : i))
        .filter((i) => i.quantity > 0);
      write(slug, next);
    },
    [slug],
  );
  const clear = useCallback(() => write(slug, []), [slug]);
  const totalCents = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { items, add, setQuantity, clear, totalCents, count };
}

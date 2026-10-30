"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./cart";
import { pub } from "./styles";

export function AddToCartButton({
  slug,
  item,
  max,
}: {
  slug: string;
  item: Omit<CartItem, "quantity">;
  max: number | null;
}) {
  const { add, items } = useCart(slug);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.giftId === item.giftId)?.quantity ?? 0;
  const full = max !== null && inCart >= max;
  return (
    <button
      type="button"
      disabled={full}
      className={pub.button}
      onClick={() => {
        add(item, max);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Adicionado!" : inCart > 0 ? `Presentear (${inCart} no carrinho)` : "Presentear"}
    </button>
  );
}

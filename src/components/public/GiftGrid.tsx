import { formatBRL } from "@/lib/money";
import { AddToCartButton } from "./AddToCartButton";
import { pub } from "./styles";

export type PublicGift = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  kind: "COTA" | "PRODUTO";
  storeUrl: string | null;
  quantity: number | null;
  taken: number;
};

export function GiftGrid({ slug, gifts }: { slug: string; gifts: PublicGift[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {gifts.map((g) => {
        const left = g.quantity === null ? null : Math.max(0, g.quantity - g.taken);
        const soldOut = left === 0;
        return (
          <li key={g.id} className={`${pub.paper} flex flex-col overflow-hidden`}>
            <div className="aspect-[4/3] bg-[var(--w-bg)]">
              {g.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
              ) : (
                <div className="flex size-full items-center justify-center [font-family:var(--w-script)] text-4xl text-[var(--w-accent)]/60">
                  presente
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="[font-family:var(--w-display)] text-xl leading-snug text-[var(--w-ink)]">{g.title}</h3>
              {g.description && <p className={pub.muted}>{g.description}</p>}
              <p className="[font-family:var(--w-display)] text-2xl text-[var(--w-accent)]">{formatBRL(g.priceCents)}</p>
              {g.quantity !== null && g.quantity > 1 && (
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--w-line)]">
                    <div
                      className="h-full rounded-full bg-[var(--w-accent)]"
                      style={{ width: `${Math.min(100, (g.taken / g.quantity) * 100)}%` }}
                    />
                  </div>
                  <p className={`${pub.muted} mt-1`}>
                    {g.taken} de {g.quantity} {g.quantity === 1 ? "escolhido" : "escolhidos"}
                  </p>
                </div>
              )}
              <div className="mt-auto flex flex-col gap-2 pt-2">
                {soldOut ? (
                  <p className={pub.muted}>Já escolhido. Obrigado!</p>
                ) : (
                  <AddToCartButton
                    slug={slug}
                    item={{ giftId: g.id, title: g.title, priceCents: g.priceCents, imageUrl: g.imageUrl }}
                    max={left}
                  />
                )}
                {g.kind === "PRODUTO" && g.storeUrl && (
                  <a href={g.storeUrl} target="_blank" rel="noopener noreferrer" className={pub.buttonGhost}>
                    Comprar na loja
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

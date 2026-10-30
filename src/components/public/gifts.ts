import { db } from "@/server/db";
import { takenByGift } from "@/server/orders";
import type { PublicGift } from "./GiftGrid";

export async function loadPublicGifts(weddingId: string, limit?: number): Promise<PublicGift[]> {
  const gifts = await db.gift.findMany({
    where: { weddingId, active: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
  const taken = await takenByGift(weddingId, gifts.map((g) => g.id));
  return gifts.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
    priceCents: g.priceCents,
    kind: g.kind,
    storeUrl: g.storeUrl,
    quantity: g.quantity,
    taken: taken.get(g.id) ?? 0,
  }));
}

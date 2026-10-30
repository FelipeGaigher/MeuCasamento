import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { DEFAULT_SECTIONS, defaultInvitationPages } from "@/collections/content";
import { isValidSlug, slugify } from "@/lib/slug";

export async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "casamento";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    if (!isValidSlug(candidate)) continue;
    const taken = await db.wedding.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// Cria o casamento com tudo o que o painel espera existir.
export async function createWedding(
  tx: Prisma.TransactionClient,
  input: { userId: string; coupleNames: string; slug: string; date: Date; venueName: string; address: string; collectionKey?: string },
) {
  const collectionKey = input.collectionKey ?? "cereja";
  return tx.wedding.create({
    data: {
      slug: input.slug,
      coupleNames: input.coupleNames,
      members: { create: { userId: input.userId, role: "OWNER" } },
      events: {
        create: {
          kind: "CERIMONIA",
          title: "Cerimônia",
          startsAt: input.date,
          venueName: input.venueName,
          address: input.address,
        },
      },
      site: {
        create: {
          collectionKey,
          sections: DEFAULT_SECTIONS as unknown as Prisma.InputJsonValue,
          heroTitle: input.coupleNames,
          heroSubtitle: "Vamos casar!",
        },
      },
      invitation: {
        create: {
          collectionKey,
          pages: defaultInvitationPages(input.coupleNames) as unknown as Prisma.InputJsonValue,
        },
      },
      payout: { create: {} },
    },
  });
}

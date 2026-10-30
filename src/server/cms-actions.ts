"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { readPages, type InvitationPageKind } from "@/collections/content";
import { done, fail, type ActionState } from "@/lib/action";
import { readCopy } from "@/lib/cms";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";

// Salva os textos editados direto na pagina do casal (tecla E).
// O casamento vem da sessao; o slug so confirma que a pagina aberta e a dele.
export async function saveInlineCopy(slug: string, raw: unknown): Promise<ActionState> {
  const { wedding } = await requireWedding();
  if (wedding.slug !== slug) return fail("Esta página é de outro casamento.");
  const copy = readCopy(raw);
  if (!copy || Object.keys(copy).length === 0) return fail("Nenhum texto válido para salvar.");

  const site: Record<string, string | null> = {};
  const pageFields = new Map<InvitationPageKind, Record<string, string>>();
  for (const [path, value] of Object.entries(copy)) {
    const [scope, a, b] = path.split(".");
    if (scope === "site") site[a] = value.trim() || null;
    else pageFields.set(a as InvitationPageKind, { ...pageFields.get(a as InvitationPageKind), [b]: value.trim() });
  }

  if (Object.keys(site).length) {
    await db.siteSettings.update({ where: { weddingId: wedding.id }, data: site });
  }
  if (pageFields.size) {
    const current = await db.invitation.findUnique({ where: { weddingId: wedding.id }, select: { pages: true } });
    const pages = readPages(current?.pages, wedding.coupleNames).map((p) =>
      pageFields.has(p.kind) ? { ...p, fields: { ...p.fields, ...pageFields.get(p.kind) } } : p,
    );
    await db.invitation.update({ where: { weddingId: wedding.id }, data: { pages: pages as unknown as Prisma.InputJsonValue } });
  }

  revalidatePath(`/${wedding.slug}`);
  revalidatePath(`/${wedding.slug}/convite`);
  revalidatePath("/painel/site");
  revalidatePath("/painel/convite");
  return done("Textos salvos.");
}

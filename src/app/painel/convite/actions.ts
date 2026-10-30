"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { COLLECTIONS } from "@/collections";
import { PAGE_FIELDS, readPages, type InvitationPage, type InvitationPageKind } from "@/collections/content";
import { done, fail, type ActionState } from "@/lib/action";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";

const MAX_FIELD = 2000;

function revalidate(slug: string) {
  revalidatePath("/painel/convite");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/convite`);
}

export async function setInvitationCollection(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const key = String(form.get("collectionKey") ?? "");
  if (!COLLECTIONS.some((c) => c.key === key)) return fail("Coleção inválida.");
  await db.invitation.update({ where: { weddingId: wedding.id }, data: { collectionKey: key } });
  if (form.get("applyToSite") === "on") {
    await db.siteSettings.update({ where: { weddingId: wedding.id }, data: { collectionKey: key } });
    revalidatePath("/painel/site");
  }
  revalidate(wedding.slug);
  return done("Coleção do convite atualizada.");
}

export async function saveInvitationPages(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const current = await db.invitation.findUnique({ where: { weddingId: wedding.id } });
  const base = readPages(current?.pages, wedding.coupleNames);
  const pages: InvitationPage[] = base.map((p) => {
    const kind = p.kind as InvitationPageKind;
    const fields: Record<string, string> = {};
    for (const [key] of PAGE_FIELDS[kind]) {
      const raw = form.get(`${kind}.${key}`);
      fields[key] = typeof raw === "string" ? raw.trim().slice(0, MAX_FIELD) : p.fields[key] ?? "";
    }
    return { kind, enabled: form.get(`${kind}.enabled`) === "on", fields };
  });
  if (!pages.some((p) => p.enabled)) return fail("Deixe pelo menos uma página ligada.");
  await db.invitation.update({
    where: { weddingId: wedding.id },
    data: { pages: pages as unknown as Prisma.InputJsonValue },
  });
  revalidate(wedding.slug);
  return done("Textos do convite salvos.");
}

export async function markInvitationReviewed() {
  const { wedding } = await requireWedding();
  await db.invitation.update({ where: { weddingId: wedding.id }, data: { publishedAt: new Date() } });
  revalidate(wedding.slug);
}

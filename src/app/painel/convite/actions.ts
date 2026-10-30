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

function parseJson(raw: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(raw ?? ""));
  } catch {
    return null;
  }
}

// Colecao, paginas ligadas e textos saem juntos do editor com previa.
export async function saveInvitation(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const key = String(form.get("collectionKey") ?? "");
  if (!COLLECTIONS.some((c) => c.key === key)) return fail("Coleção inválida.");

  const raw = parseJson(form.get("pages"));
  if (!Array.isArray(raw)) return fail("Páginas inválidas.");
  const sent = new Map<string, { enabled?: unknown; fields?: unknown }>();
  for (const item of raw) if (item && typeof item === "object" && "kind" in item) sent.set(String(item.kind), item);

  // So entram paginas e campos conhecidos; o resto do payload e ignorado.
  const pages: InvitationPage[] = readPages(null, wedding.coupleNames).map((d) => {
    const kind = d.kind as InvitationPageKind;
    const page = sent.get(kind);
    const given = page?.fields && typeof page.fields === "object" ? (page.fields as Record<string, unknown>) : {};
    const fields: Record<string, string> = {};
    for (const [field] of PAGE_FIELDS[kind]) {
      const v = given[field];
      fields[field] = typeof v === "string" ? v.trim().slice(0, MAX_FIELD) : "";
    }
    return { kind, enabled: page?.enabled !== false, fields };
  });
  if (!pages.some((p) => p.enabled)) return fail("Deixe pelo menos uma página ligada.");

  await db.invitation.update({
    where: { weddingId: wedding.id },
    data: { collectionKey: key, pages: pages as unknown as Prisma.InputJsonValue },
  });
  if (form.get("applyToSite") === "on") {
    await db.siteSettings.update({ where: { weddingId: wedding.id }, data: { collectionKey: key } });
    revalidatePath("/painel/site");
  }
  revalidate(wedding.slug);
  return done("Convite salvo.");
}

export async function markInvitationReviewed() {
  const { wedding } = await requireWedding();
  await db.invitation.update({ where: { weddingId: wedding.id }, data: { publishedAt: new Date() } });
  revalidate(wedding.slug);
}

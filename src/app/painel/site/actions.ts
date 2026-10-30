"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { COLLECTIONS, FONT_PAIRS } from "@/collections";
import { readSections } from "@/collections/content";
import { done, fail, type ActionState } from "@/lib/action";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";

function revalidate(slug: string) {
  revalidatePath("/painel/site");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/convite`);
}

export async function saveTheme(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  let collectionKey = String(form.get("collectionKey") ?? "");
  const fontPairKey = String(form.get("fontPairKey") ?? "");
  if (form.get("sameAsInvitation") === "on") {
    const inv = await db.invitation.findUnique({ where: { weddingId: wedding.id }, select: { collectionKey: true } });
    if (inv) collectionKey = inv.collectionKey;
  }
  if (!COLLECTIONS.some((c) => c.key === collectionKey)) return fail("Coleção inválida.");
  if (!(fontPairKey in FONT_PAIRS)) return fail("Par de fontes inválido.");
  await db.siteSettings.update({ where: { weddingId: wedding.id }, data: { collectionKey, fontPairKey } });
  revalidate(wedding.slug);
  return done("Tema do site atualizado.");
}

const contentSchema = z.object({
  heroTitle: z.string().trim().max(120),
  heroSubtitle: z.string().trim().max(120),
  story: z.string().trim().max(6000),
  heroImageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "A foto precisa ser um link começando com https://"),
});

export async function saveSiteContent(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const parsed = contentSchema.safeParse({
    heroTitle: form.get("heroTitle") ?? "",
    heroSubtitle: form.get("heroSubtitle") ?? "",
    story: form.get("story") ?? "",
    heroImageUrl: form.get("heroImageUrl") ?? "",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;
  await db.siteSettings.update({
    where: { weddingId: wedding.id },
    data: {
      heroTitle: d.heroTitle || null,
      heroSubtitle: d.heroSubtitle || null,
      story: d.story || null,
      heroImageUrl: d.heroImageUrl || null,
    },
  });
  revalidate(wedding.slug);
  return done("Textos do site salvos.");
}

export async function saveSections(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const site = await db.siteSettings.findUnique({ where: { weddingId: wedding.id }, select: { sections: true } });
  const sections = readSections(site?.sections).map((s) => ({ ...s, enabled: form.get(`enabled.${s.key}`) === "on" }));

  const move = String(form.get("move") ?? "");
  if (move) {
    const [key, dir] = move.split(":");
    const i = sections.findIndex((s) => s.key === key);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i >= 0 && j >= 0 && j < sections.length) [sections[i], sections[j]] = [sections[j], sections[i]];
  }

  await db.siteSettings.update({
    where: { weddingId: wedding.id },
    data: { sections: sections as unknown as Prisma.InputJsonValue },
  });
  revalidate(wedding.slug);
  return done(move ? "Ordem atualizada." : "Seções salvas.");
}

export async function setPublished(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const publish = form.get("publish") === "1";
  await db.wedding.update({ where: { id: wedding.id }, data: { status: publish ? "PUBLISHED" : "DRAFT" } });
  revalidate(wedding.slug);
  revalidatePath("/painel");
  return done(publish ? "Site publicado." : "Site voltou para rascunho.");
}

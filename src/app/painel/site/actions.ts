"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { COLLECTIONS, FONT_PAIRS } from "@/collections";
import { readSections, SECTION_LABELS } from "@/collections/content";
import { done, fail, type ActionState } from "@/lib/action";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";

function revalidate(slug: string) {
  revalidatePath("/painel/site");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/convite`);
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

const siteSchema = contentSchema.extend({
  collectionKey: z.string().refine((v) => COLLECTIONS.some((c) => c.key === v), "Coleção inválida."),
  fontPairKey: z.string().refine((v) => v in FONT_PAIRS, "Par de fontes inválido."),
  sections: z
    .array(z.object({ key: z.string(), enabled: z.boolean() }))
    .refine((list) => list.every((s) => s.key in SECTION_LABELS) && new Set(list.map((s) => s.key)).size === list.length, "Seções inválidas."),
});

function parseJson(raw: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(raw ?? ""));
  } catch {
    return null;
  }
}

// Tema, secoes e textos saem juntos do editor com previa: um rascunho, um salvar.
export async function saveSite(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const parsed = siteSchema.safeParse({
    collectionKey: form.get("collectionKey") ?? "",
    fontPairKey: form.get("fontPairKey") ?? "",
    sections: parseJson(form.get("sections")),
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
      collectionKey: d.collectionKey,
      fontPairKey: d.fontPairKey,
      sections: readSections(d.sections) as unknown as Prisma.InputJsonValue,
      heroTitle: d.heroTitle || null,
      heroSubtitle: d.heroSubtitle || null,
      story: d.story || null,
      heroImageUrl: d.heroImageUrl || null,
    },
  });
  revalidate(wedding.slug);
  return done("Site salvo.");
}

export async function setPublished(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const publish = form.get("publish") === "1";
  await db.wedding.update({ where: { id: wedding.id }, data: { status: publish ? "PUBLISHED" : "DRAFT" } });
  revalidate(wedding.slug);
  revalidatePath("/painel");
  return done(publish ? "Site publicado." : "Site voltou para rascunho.");
}

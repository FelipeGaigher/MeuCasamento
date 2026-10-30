"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { done, fail, type ActionState } from "@/lib/action";
import { fromLocalInput } from "@/lib/dates";
import { isValidSlug, slugify } from "@/lib/slug";

const optional = z.string().trim().max(500).optional().transform((v) => (v ? v : null));

const eventSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["CERIMONIA", "RECEPCAO", "NOIVADO", "CHA", "OUTRO"]),
  title: z.string().trim().min(2, "Informe o título.").max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Informe o horário."),
  venueName: z.string().trim().min(2, "Informe o local.").max(120),
  address: z.string().trim().min(3, "Informe o endereço.").max(200),
  mapsUrl: optional.refine((v) => !v || /^https?:\/\//.test(v), "O link do mapa precisa começar com http."),
  dressCode: optional,
  notes: optional,
  order: z.coerce.number().int().min(0).max(99).default(0),
});

function revalidateAll(slug: string) {
  revalidatePath("/painel", "layout");
  revalidatePath(`/${slug}`, "layout");
}

export async function saveEvent(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const parsed = eventSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const { id, date, time, ...rest } = parsed.data;
  const data = { ...rest, startsAt: fromLocalInput(date, time) };

  if (id) {
    // updateMany com weddingId: nunca altera evento de outro casamento.
    const res = await db.event.updateMany({ where: { id, weddingId: wedding.id }, data });
    if (res.count === 0) return fail("Evento não encontrado.");
  } else {
    await db.event.create({ data: { ...data, weddingId: wedding.id } });
  }
  revalidateAll(wedding.slug);
  return done(id ? "Evento atualizado." : "Evento adicionado.");
}

export async function deleteEvent(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const id = String(form.get("id") ?? "");
  const total = await db.event.count({ where: { weddingId: wedding.id } });
  if (total <= 1) return fail("O casamento precisa de pelo menos um evento.");
  const res = await db.event.deleteMany({ where: { id, weddingId: wedding.id } });
  if (res.count === 0) return fail("Evento não encontrado.");
  revalidateAll(wedding.slug);
  return done("Evento removido.");
}

const weddingSchema = z.object({
  coupleNames: z.string().trim().min(3, "Informe o nome do casal.").max(80),
  slug: z.string().trim().toLowerCase(),
});

export async function saveWedding(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const parsed = weddingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const slug = slugify(parsed.data.slug);
  if (!isValidSlug(slug)) return fail("Endereço inválido. Use letras, números e hífen (3 a 48 caracteres).");
  if (slug !== wedding.slug) {
    const taken = await db.wedding.findUnique({ where: { slug }, select: { id: true } });
    if (taken) return fail("Esse endereço já está em uso. Tente outro.");
  }
  await db.wedding.update({ where: { id: wedding.id }, data: { coupleNames: parsed.data.coupleNames, slug } });
  revalidatePath("/painel", "layout");
  revalidatePath(`/${wedding.slug}`, "layout");
  revalidatePath(`/${slug}`, "layout");
  return done(slug !== wedding.slug ? `Salvo. O novo endereço é /${slug}.` : "Salvo.");
}

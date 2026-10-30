"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { parseBRL } from "@/lib/money";
import { done, fail, type ActionState } from "@/lib/action";
import { SUGGESTIONS } from "./suggestions";

const url = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^https?:\/\//.test(v), "Use um link completo, começando com https://")
  .transform((v) => v || null);

const giftSchema = z.object({
  title: z.string().trim().min(2, "Informe o nome do presente.").max(120),
  description: z.string().trim().max(400).transform((v) => v || null),
  imageUrl: url,
  price: z.string(),
  kind: z.enum(["COTA", "PRODUTO"]),
  storeUrl: url,
  quantity: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 999), "Quantidade deve ser um número inteiro de 1 a 999."),
  order: z.coerce.number().int().min(0).max(9999),
  active: z.boolean(),
});

function read(form: FormData) {
  const parsed = giftSchema.safeParse({
    title: form.get("title") ?? "",
    description: form.get("description") ?? "",
    imageUrl: form.get("imageUrl") ?? "",
    price: form.get("price") ?? "",
    kind: form.get("kind") ?? "COTA",
    storeUrl: form.get("storeUrl") ?? "",
    quantity: form.get("quantity") ?? "",
    order: form.get("order") || 0,
    active: form.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const priceCents = parseBRL(parsed.data.price);
  if (priceCents === null || priceCents < 500) return { error: "Informe um valor a partir de R$ 5,00." } as const;
  const { price, ...rest } = parsed.data;
  void price;
  return { data: { ...rest, priceCents } } as const;
}

export async function createGift(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const r = read(form);
  if ("error" in r) return fail(r.error!);
  await db.gift.create({ data: { ...r.data, weddingId: wedding.id } });
  revalidatePath("/painel/presentes");
  return done(`"${r.data.title}" entrou na lista.`);
}

export async function updateGift(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const r = read(form);
  if ("error" in r) return fail(r.error!);
  const res = await db.gift.updateMany({ where: { id: String(form.get("id") ?? ""), weddingId: wedding.id }, data: r.data });
  if (res.count === 0) return fail("Presente não encontrado.");
  revalidatePath("/painel/presentes");
  return done();
}

// Presente com pedido nao pode sumir do historico: vira inativo.
export async function deleteGift(form: FormData) {
  const { wedding } = await requireWedding();
  const id = String(form.get("id") ?? "");
  const used = await db.orderItem.count({ where: { giftId: id, weddingId: wedding.id } });
  if (used > 0) await db.gift.updateMany({ where: { id, weddingId: wedding.id }, data: { active: false } });
  else await db.gift.deleteMany({ where: { id, weddingId: wedding.id } });
  revalidatePath("/painel/presentes");
}

export async function addSuggestion(form: FormData) {
  const { wedding } = await requireWedding();
  const s = SUGGESTIONS.find((x) => x.title === form.get("title"));
  if (!s) return;
  const last = await db.gift.aggregate({ where: { weddingId: wedding.id }, _max: { order: true } });
  await db.gift.create({
    data: { weddingId: wedding.id, title: s.title, description: s.description, priceCents: s.priceCents, kind: "COTA", order: (last._max.order ?? 0) + 1 },
  });
  revalidatePath("/painel/presentes");
}

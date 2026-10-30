"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { done, fail, type ActionState } from "@/lib/action";
import { parseGuestLines } from "./parse";

const optional = z.string().trim().max(200).transform((v) => v || null);

const guestSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do convidado.").max(120),
  household: optional,
  phone: optional,
  email: z.string().trim().toLowerCase().email("E-mail inválido.").or(z.literal("")).transform((v) => v || null),
  group: optional,
  maxCompanions: z.coerce.number().int().min(0, "Acompanhantes não pode ser negativo.").max(20),
  notes: optional,
});

const read = (form: FormData) =>
  guestSchema.safeParse({
    name: form.get("name") ?? "",
    household: form.get("household") ?? "",
    phone: form.get("phone") ?? "",
    email: form.get("email") ?? "",
    group: form.get("group") ?? "",
    maxCompanions: form.get("maxCompanions") || 0,
    notes: form.get("notes") ?? "",
  });

export async function addGuest(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const parsed = read(form);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  await db.guest.create({ data: { ...parsed.data, weddingId: wedding.id } });
  revalidatePath("/painel/convidados");
  return done(`${parsed.data.name} foi adicionado(a).`);
}

export async function updateGuest(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const id = String(form.get("id") ?? "");
  const parsed = read(form);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const res = await db.guest.updateMany({ where: { id, weddingId: wedding.id }, data: parsed.data });
  if (res.count === 0) return fail("Convidado não encontrado.");
  revalidatePath("/painel/convidados");
  return done();
}

export async function deleteGuest(form: FormData) {
  const { wedding } = await requireWedding();
  await db.guest.deleteMany({ where: { id: String(form.get("id") ?? ""), weddingId: wedding.id } });
  revalidatePath("/painel/convidados");
}

export async function importGuests(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const rows = parseGuestLines(String(form.get("lines") ?? ""));
  if (rows.length === 0) return fail("Cole pelo menos um nome, um por linha.");
  if (rows.length > 1000) return fail("Cole no máximo 1.000 convidados por vez.");
  await db.guest.createMany({ data: rows.map((r) => ({ ...r, weddingId: wedding.id })) });
  revalidatePath("/painel/convidados");
  return done(`${rows.length} ${rows.length === 1 ? "convidado adicionado" : "convidados adicionados"}.`);
}

const rsvpSchema = z.object({
  guestId: z.string().min(1),
  status: z.enum(["PENDENTE", "CONFIRMADO", "RECUSADO"]),
  adults: z.coerce.number().int().min(0).max(20),
  children: z.coerce.number().int().min(0).max(20),
});

// Resposta marcada pelo casal (ex.: o convidado avisou por telefone).
export async function setRsvp(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const parsed = rsvpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail("Confira a resposta.");
  const d = parsed.data;
  const guest = await db.guest.findFirst({ where: { id: d.guestId, weddingId: wedding.id } });
  if (!guest) return fail("Convidado não encontrado.");
  const confirmed = d.status === "CONFIRMADO";
  const data = {
    status: d.status,
    adults: confirmed ? Math.max(1, d.adults) : 0,
    children: confirmed ? d.children : 0,
    respondedAt: d.status === "PENDENTE" ? null : new Date(),
  };
  await db.rsvp.upsert({
    where: { guestId: guest.id },
    create: { ...data, guestId: guest.id, weddingId: wedding.id },
    update: data,
  });
  revalidatePath("/painel/convidados");
  return done("Resposta salva.");
}

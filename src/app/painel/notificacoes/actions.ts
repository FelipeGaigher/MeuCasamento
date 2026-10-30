"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { done, fail, type ActionState } from "@/lib/action";

const schema = z.object({
  notifyPhone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || (v.length >= 10 && v.length <= 13), "WhatsApp inválido. Use DDD + número, por exemplo 27 99999-9999."),
  notifyEmail: z.string().trim().toLowerCase().refine((v) => v === "" || z.string().email().safeParse(v).success, "E-mail inválido."),
  notifyOnOrder: z.literal("on").optional(),
  notifyOnRsvp: z.literal("on").optional(),
});

export async function saveNotificationSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;
  // Guarda com DDI 55 quando vier so DDD + numero.
  const phone = d.notifyPhone && d.notifyPhone.length <= 11 ? `55${d.notifyPhone}` : d.notifyPhone;
  await db.wedding.update({
    where: { id: wedding.id },
    data: {
      notifyPhone: phone || null,
      notifyEmail: d.notifyEmail || null,
      notifyOnOrder: d.notifyOnOrder === "on",
      notifyOnRsvp: d.notifyOnRsvp === "on",
    },
  });
  revalidatePath("/painel", "layout");
  return done("Preferências salvas.");
}

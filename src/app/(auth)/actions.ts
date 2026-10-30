"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/server/db";
import { checkPassword, hashPassword } from "@/server/auth/password";
import { clearSessionCookie, setSessionCookie } from "@/server/auth/session";
import { createWedding, uniqueSlug } from "@/server/wedding";
import { fromLocalInput } from "@/lib/dates";
import { fail, type ActionState } from "@/lib/action";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("E-mail invalido."),
  password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres."),
  coupleNames: z.string().trim().min(3, "Informe o nome do casal, por exemplo: Ana & Pedro."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data do casamento."),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  venueName: z.string().trim().min(2, "Informe o local."),
  address: z.string().trim().min(3, "Informe o endereco."),
  collectionKey: z.string().optional(),
});

export async function signup(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;
  if (await db.user.findUnique({ where: { email: d.email } })) return fail("Ja existe uma conta com esse e-mail.");

  const slug = await uniqueSlug(d.coupleNames);
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { email: d.email, name: d.name, passwordHash: await hashPassword(d.password) } });
    await createWedding(tx, {
      userId: u.id,
      coupleNames: d.coupleNames,
      slug,
      date: fromLocalInput(d.date, d.time || "16:00"),
      venueName: d.venueName,
      address: d.address,
      collectionKey: d.collectionKey,
    });
    return u;
  });
  await setSessionCookie({ sub: user.id, email: user.email, name: user.name });
  redirect("/painel");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail invalido."),
  password: z.string().min(1, "Informe a senha."),
  voltar: z.string().optional(),
});

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await checkPassword(parsed.data.password, user.passwordHash))) return fail("E-mail ou senha incorretos.");
  await setSessionCookie({ sub: user.id, email: user.email, name: user.name });
  const back = parsed.data.voltar;
  redirect(back && back.startsWith("/painel") ? back : "/painel");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

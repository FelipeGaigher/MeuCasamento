"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { AsaasError, createSubaccount, isDemoPayments } from "@/server/payment/asaas";
import { done, fail, type ActionState } from "@/lib/action";
import { parseBRL } from "@/lib/money";

const digits = (v: string) => v.replace(/\D/g, "");

// Os dados do titular so passam por aqui a caminho do Asaas: nada disso e gravado.
const schema = z.object({
  name: z.string().trim().min(5, "Informe o nome completo do titular.").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  cpfCnpj: z.string().transform(digits).refine((v) => v.length === 11 || v.length === 14, "CPF ou CNPJ inválido."),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento."),
  mobilePhone: z.string().transform(digits).refine((v) => v.length >= 10 && v.length <= 11, "Celular inválido. Use DDD + número."),
  incomeValue: z.string().transform((v) => parseBRL(v)).refine((v) => v !== null && v > 0, "Informe a renda mensal."),
  postalCode: z.string().transform(digits).refine((v) => v.length === 8, "CEP inválido."),
  address: z.string().trim().min(3, "Informe a rua.").max(120),
  addressNumber: z.string().trim().min(1, "Informe o número.").max(10),
  province: z.string().trim().min(2, "Informe o bairro.").max(80),
});

export async function createPayoutAccount(_: ActionState, form: FormData): Promise<ActionState> {
  const { wedding } = await requireWedding();
  if (isDemoPayments()) return fail("Os pagamentos estão em modo de demonstração. Use a conta de demonstração.");

  const current = await db.payoutAccount.findUnique({ where: { weddingId: wedding.id } });
  if (current?.walletId) return fail("Este casamento já tem uma conta de recebimento.");

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const { incomeValue, ...rest } = parsed.data;

  try {
    const { accountId, walletId } = await createSubaccount({ ...rest, incomeValue: (incomeValue ?? 0) / 100 });
    await db.payoutAccount.upsert({
      where: { weddingId: wedding.id },
      create: { weddingId: wedding.id, asaasAccountId: accountId, walletId, status: "EM_ANALISE" },
      update: { asaasAccountId: accountId, walletId, status: "EM_ANALISE" },
    });
  } catch (e) {
    return fail(e instanceof AsaasError ? e.message : "Não foi possível criar a conta agora. Tente de novo em alguns minutos.");
  }
  revalidatePath("/painel", "layout");
  return done("Conta criada. O Asaas vai pedir a confirmação dos documentos por e-mail.");
}

export async function activateDemoAccount(_: ActionState): Promise<ActionState> {
  const { wedding } = await requireWedding();
  if (!isDemoPayments()) return fail("Conta de demonstração só existe com os pagamentos em modo de demonstração.");
  await db.payoutAccount.upsert({
    where: { weddingId: wedding.id },
    create: { weddingId: wedding.id, walletId: "demo", status: "ATIVA" },
    update: { walletId: "demo", status: "ATIVA" },
  });
  revalidatePath("/painel", "layout");
  return done("Conta de demonstração ativada.");
}

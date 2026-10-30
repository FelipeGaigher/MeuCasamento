import Link from "next/link";
import type { Metadata } from "next";
import { login } from "../actions";
import { AuthShell } from "../AuthShell";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FORM_GRID, Field, Input } from "@/components/ui";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ voltar?: string }> }) {
  const { voltar } = await searchParams;
  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse o painel do seu casamento."
      footer={<>Ainda não tem conta? <Link href="/criar" className="text-brand underline">Criar grátis</Link></>}
    >
      <ActionForm action={login} className={FORM_GRID}>
        <input type="hidden" name="voltar" value={voltar ?? ""} />
        <Field label="E-mail" wide>
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Senha" wide>
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <div className="sm:col-span-2">
          <SubmitButton pendingText="Entrando...">Entrar</SubmitButton>
        </div>
      </ActionForm>
    </AuthShell>
  );
}

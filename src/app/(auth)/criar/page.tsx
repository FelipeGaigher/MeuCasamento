import Link from "next/link";
import type { Metadata } from "next";
import { signup } from "../actions";
import { AuthShell } from "../AuthShell";
import { CollectionPicker } from "./CollectionPicker";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FORM_GRID, Field, Input } from "@/components/ui";

export const metadata: Metadata = { title: "Criar meu casamento" };

export default function CriarPage() {
  return (
    <AuthShell
      title="Criar meu casamento"
      subtitle="Comece com o básico. Textos, fotos e presentes vocês completam no painel."
      footer={<>Já tem conta? <Link href="/entrar" className="text-brand underline">Entrar</Link></>}
    >
      <ActionForm action={signup} className={FORM_GRID}>
        <p className="t-section sm:col-span-2">Sua conta</p>
        <Field label="Seu nome">
          <Input name="name" autoComplete="name" required />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Senha" hint="Pelo menos 8 caracteres." wide>
          <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>

        <p className="t-section mt-4 sm:col-span-2">O casamento</p>
        <Field label="Nome do casal" hint="Como vai aparecer no convite, por exemplo: Ana & Pedro." wide>
          <Input name="coupleNames" required />
        </Field>
        <Field label="Data">
          <Input name="date" type="date" required />
        </Field>
        <Field label="Horário">
          <Input name="time" type="time" defaultValue="16:00" />
        </Field>
        <Field label="Local da cerimônia">
          <Input name="venueName" placeholder="Igreja, sítio, salão..." required />
        </Field>
        <Field label="Endereço">
          <Input name="address" placeholder="Rua, número, cidade" required />
        </Field>

        <CollectionPicker />

        <div className="mt-2 sm:col-span-2">
          <SubmitButton pendingText="Criando...">Criar meu casamento</SubmitButton>
        </div>
      </ActionForm>
    </AuthShell>
  );
}

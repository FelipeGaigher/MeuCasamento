import type { Guest } from "@prisma/client";
import { Field, Input } from "@/components/ui";

export function GuestFields({ guest }: { guest?: Guest }) {
  return (
    <>
      <Field label="Nome" wide>
        <Input name="name" required defaultValue={guest?.name} placeholder="Nome como está no convite" />
      </Field>
      <Field label="Telefone (WhatsApp)">
        <Input name="phone" defaultValue={guest?.phone ?? ""} inputMode="tel" placeholder="(27) 99999-0000" />
      </Field>
      <Field label="E-mail">
        <Input name="email" type="email" defaultValue={guest?.email ?? ""} />
      </Field>
      <Field label="Grupo" hint="Ex.: Família da noiva, Amigos do trabalho">
        <Input name="group" defaultValue={guest?.group ?? ""} />
      </Field>
      <Field label="Família ou casa" hint="Aparece na busca para diferenciar nomes iguais">
        <Input name="household" defaultValue={guest?.household ?? ""} />
      </Field>
      <Field label="Acompanhantes permitidos">
        <Input name="maxCompanions" type="number" min={0} max={20} defaultValue={guest?.maxCompanions ?? 0} />
      </Field>
      <Field label="Observações">
        <Input name="notes" defaultValue={guest?.notes ?? ""} />
      </Field>
    </>
  );
}

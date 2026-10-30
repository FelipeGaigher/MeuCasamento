import type { Rsvp } from "@prisma/client";
import { Field, FORM_GRID, Input, Select } from "@/components/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { setRsvp } from "./actions";

// O casal marca a resposta quando o convidado avisa por outro meio.
export function RsvpEditor({ guestId, limit, rsvp }: { guestId: string; limit: number; rsvp: Rsvp | null }) {
  return (
    <ActionForm action={setRsvp} className={FORM_GRID}>
      <input type="hidden" name="guestId" value={guestId} />
      <Field label="Resposta" wide>
        <Select name="status" defaultValue={rsvp?.status ?? "PENDENTE"}>
          <option value="PENDENTE">Sem resposta</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="RECUSADO">Não vai</option>
        </Select>
      </Field>
      <Field label="Adultos">
        <Input name="adults" type="number" min={0} max={limit} defaultValue={rsvp?.adults ?? 1} />
      </Field>
      <Field label="Crianças">
        <Input name="children" type="number" min={0} max={limit} defaultValue={rsvp?.children ?? 0} />
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton variant="secondary">Salvar resposta</SubmitButton>
      </div>
    </ActionForm>
  );
}

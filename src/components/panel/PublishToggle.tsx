"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge } from "@/components/ui";
import type { ActionState } from "@/lib/action";

// Status de publicacao + botao que troca, no cabecalho da tela.
export function PublishToggle({
  published,
  action,
}: {
  published: boolean;
  action: (prev: ActionState, data: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="publish" value={published ? "0" : "1"} />
      <Badge tone={published ? "ok" : "warn"}>{published ? "No ar" : "Rascunho"}</Badge>
      <SubmitButton variant={published ? "secondary" : "primary"} pendingText="Atualizando...">
        {published ? "Voltar para rascunho" : "Publicar site"}
      </SubmitButton>
      {state?.error && <p className="t-meta w-full text-danger">{state.error}</p>}
    </form>
  );
}

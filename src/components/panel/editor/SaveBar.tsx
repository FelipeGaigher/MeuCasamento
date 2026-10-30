"use client";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui";
import type { ActionState } from "@/lib/action";
import { cn } from "@/lib/cn";

// Barra de salvar do editor, presa no rodape da coluna do formulario.
// Diz se ha mudanca nao salva e mostra o resultado do ultimo salvar.
export function SaveBar({
  dirty,
  state,
  onDiscard,
  label = "Salvar alterações",
}: {
  dirty: boolean;
  state: ActionState;
  onDiscard: () => void;
  label?: string;
}) {
  const note = dirty
    ? "Alterações ainda não salvas. A prévia já mostra como vai ficar."
    : state?.error
      ? state.error
      : state?.ok
        ? (state.message ?? "Salvo.")
        : "Tudo salvo.";
  return (
    <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 shadow-float">
      <p
        aria-live="polite"
        className={cn("t-meta min-w-0 flex-1", !dirty && state?.error && "text-danger", !dirty && state?.ok && "text-ok")}
      >
        {note}
      </p>
      <div className="flex gap-2">
        {dirty && (
          <Button type="button" variant="ghost" onClick={onDiscard}>
            Descartar
          </Button>
        )}
        <SubmitButton disabled={!dirty}>{label}</SubmitButton>
      </div>
    </div>
  );
}

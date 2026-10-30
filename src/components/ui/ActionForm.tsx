"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/lib/action";
import { Notice } from "./index";

// Formulario ligado a uma server action, com mensagem de sucesso ou erro.
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
}: {
  action: (prev: ActionState, data: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {state?.error && (
        <div className="mt-4 sm:col-span-2">
          <Notice tone="danger">{state.error}</Notice>
        </div>
      )}
      {state?.ok && state.message && (
        <div className="mt-4 sm:col-span-2">
          <Notice tone="ok">{state.message}</Notice>
        </div>
      )}
    </form>
  );
}

// Resultado padrao das server actions com formulario (useActionState).
export type ActionState = { ok?: boolean; error?: string; message?: string } | undefined;

export const fail = (error: string): ActionState => ({ ok: false, error });
export const done = (message = "Salvo."): ActionState => ({ ok: true, message });

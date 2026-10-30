"use client";

import { useState } from "react";
import { pub } from "./styles";

export type RsvpInitial = { status: "PENDENTE" | "CONFIRMADO" | "RECUSADO"; adults: number; children: number; message: string | null };

export function RsvpForm({
  slug,
  token,
  name,
  limit,
  initial,
}: {
  slug: string;
  token: string;
  name: string;
  limit: number;
  initial?: RsvpInitial | null;
}) {
  const [going, setGoing] = useState<boolean | null>(
    initial?.status === "CONFIRMADO" ? true : initial?.status === "RECUSADO" ? false : null,
  );
  const [adults, setAdults] = useState(Math.max(1, initial?.adults ?? 1));
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [message, setMessage] = useState(initial?.message ?? "");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [answered, setAnswered] = useState<boolean | null>(null);

  const options = (max: number, min = 0) => Array.from({ length: max - min + 1 }, (_, i) => i + min);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (going === null) return setError("Conte para a gente se você vai.");
    setState("sending");
    setError(null);
    const res = await fetch(`/api/public/${slug}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, status: going ? "CONFIRMADO" : "RECUSADO", adults, children, message }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("idle");
      return setError(data.error ?? "Não foi possível enviar. Tente de novo.");
    }
    setAnswered(going);
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="text-center">
        <p className={pub.kicker}>{answered ? "Que alegria!" : "Obrigado por avisar"}</p>
        <p className={`${pub.body} mt-2`}>
          {answered ? "Sua presença está confirmada. Até lá!" : "Vamos sentir sua falta. Obrigado pelo carinho."}
        </p>
        <button type="button" onClick={() => setState("idle")} className={`${pub.muted} mt-4 underline underline-offset-4`}>
          Alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <p className={pub.body}>
        Olá, <strong>{name}</strong>! Você vai?
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setGoing(true)}
          className={going === true ? pub.button : pub.buttonGhost}
          aria-pressed={going === true}
        >
          Sim, estarei lá
        </button>
        <button
          type="button"
          onClick={() => setGoing(false)}
          className={going === false ? pub.button : pub.buttonGhost}
          aria-pressed={going === false}
        >
          Não poderei ir
        </button>
      </div>
      {going && limit > 1 && (
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={pub.label}>Adultos</span>
            <select
              className={pub.input}
              value={adults}
              onChange={(e) => {
                const v = Number(e.target.value);
                setAdults(v);
                setChildren((c) => Math.min(c, limit - v));
              }}
            >
              {options(limit, 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={pub.label}>Crianças</span>
            <select className={pub.input} value={children} onChange={(e) => setChildren(Number(e.target.value))}>
              {options(limit - adults).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <p className={`${pub.muted} col-span-2`}>
            Este convite é para até {limit} pessoas.
          </p>
        </div>
      )}
      {going !== null && (
        <label className="flex flex-col gap-1.5">
          <span className={pub.label}>Recado para o casal (opcional)</span>
          <textarea className={pub.input} rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
      )}
      {error && <p className="text-base text-[var(--w-accent)]">{error}</p>}
      <button type="submit" disabled={state === "sending" || going === null} className={pub.button}>
        {state === "sending" ? "Enviando..." : "Enviar resposta"}
      </button>
    </form>
  );
}

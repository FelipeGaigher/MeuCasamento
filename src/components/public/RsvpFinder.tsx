"use client";

import { useEffect, useState } from "react";
import { RsvpForm } from "./RsvpForm";
import { pub } from "./styles";

type Result = { token: string; name: string; household: string | null; limit: number };

// Busca do convidado pelo nome antes de responder.
export function RsvpFinder({ slug }: { slug: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Result | null>(null);

  useEffect(() => {
    setError(null);
    if (q.trim().length < 3) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const res = await fetch(`/api/public/${slug}/rsvp?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).catch(() => null);
      if (ctrl.signal.aborted) return;
      setSearching(false);
      if (res?.ok) {
        setResults((await res.json()).results);
        return;
      }
      // Sem conexao ou erro do servidor: o convidado precisa saber que a busca nao rodou.
      setResults(null);
      setError(
        res
          ? ((await res.json().catch(() => null))?.error ?? "Não conseguimos buscar agora. Tente de novo em instantes.")
          : "Sem conexão. Confira a internet e tente de novo.",
      );
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, slug]);

  if (chosen) {
    return (
      <div>
        <RsvpForm slug={slug} token={chosen.token} name={chosen.name} limit={chosen.limit} />
        <button type="button" onClick={() => setChosen(null)} className={`${pub.muted} mt-4 underline underline-offset-4`}>
          Não sou eu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className={pub.label}>Digite seu nome como está no convite</span>
        <input className={pub.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: Mariana Costa" autoComplete="name" />
      </label>
      <p className={pub.muted} role="status" aria-live="polite">
        {searching ? "Procurando seu nome..." : q.trim().length > 0 && q.trim().length < 3 ? "Digite pelo menos 3 letras." : ""}
      </p>
      {error && (
        <p className="text-base text-[var(--w-accent)] [font-family:var(--w-body)]" role="alert">
          {error}
        </p>
      )}
      {!searching && results && results.length === 0 && (
        <p className={pub.muted}>Não encontramos esse nome. Confira a grafia ou fale com o casal.</p>
      )}
      {results && results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((r) => (
            <li key={r.token}>
              <button
                type="button"
                onClick={() => setChosen(r)}
                className="w-full rounded-lg border border-[var(--w-line)] bg-white/70 px-4 py-3 text-left text-base text-[var(--w-ink)] [font-family:var(--w-body)] hover:border-[var(--w-accent)]"
              >
                {r.name}
                {r.household && <span className="text-[var(--w-muted)]"> · {r.household}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

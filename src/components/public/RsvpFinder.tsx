"use client";

import { useEffect, useState } from "react";
import { RsvpForm } from "./RsvpForm";
import { pub } from "./styles";

type Result = { token: string; name: string; household: string | null; limit: number };

// Busca do convidado pelo nome antes de responder.
export function RsvpFinder({ slug }: { slug: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [chosen, setChosen] = useState<Result | null>(null);

  useEffect(() => {
    if (q.trim().length < 3) {
      setResults(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const res = await fetch(`/api/public/${slug}/rsvp?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).catch(() => null);
      if (res?.ok) setResults((await res.json()).results);
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
      {results && results.length === 0 && (
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

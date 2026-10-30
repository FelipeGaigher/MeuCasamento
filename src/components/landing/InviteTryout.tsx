"use client";

import { useState } from "react";
import { COLLECTIONS } from "@/collections";
import { Input, Segmented } from "@/components/ui";
import { CollectionCard } from "./CollectionCard";

// Topo da LP: o casal digita o nome e ve o proprio convite antes de criar conta.
// Responde a pergunta de quem chega: "como fica o MEU convite?".
export function InviteTryout() {
  const [names, setNames] = useState("");
  const [key, setKey] = useState(COLLECTIONS[0].key);
  const collection = COLLECTIONS.find((c) => c.key === key) ?? COLLECTIONS[0];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="mx-auto w-full max-w-xs">
        <CollectionCard collection={collection} names={names.trim() || "Ana & Pedro"} />
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="t-label">Nomes do casal</span>
        <Input value={names} onChange={(e) => setNames(e.target.value)} placeholder="Ana & Pedro" maxLength={32} autoComplete="off" />
      </label>
      <Segmented
        label="Coleção do convite"
        value={key}
        onChange={setKey}
        options={COLLECTIONS.map((c) => ({ key: c.key, label: c.name }))}
      />
      <p className="t-meta">{collection.mood}</p>
    </div>
  );
}

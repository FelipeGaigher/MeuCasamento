"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { COLLECTIONS, FONT_PAIRS, type FontPairKey } from "@/collections";
import { CollectionSwatch } from "@/components/site/CollectionSwatch";
import { Checkbox, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";

// Pecas de escolha dos editores de convite e site. Todas controladas: o
// rascunho mora no editor, que manda o valor para a previa e para o salvar.

// Cartao de opcao (radio). Selecionado ganha borda e anel da marca.
export function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-xl border bg-surface p-2.5 transition-[border-color,box-shadow] hover:shadow-elevated",
        checked ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-brand/40",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onSelect(value)} className="sr-only" />
      {children}
    </label>
  );
}

export function ChoiceGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{children}</div>;
}

export function CollectionPicker({
  value,
  onChange,
  coupleNames,
  fontPairKey,
}: {
  value: string;
  onChange: (key: string) => void;
  coupleNames: string;
  fontPairKey?: string | null;
}) {
  return (
    <ChoiceGrid>
      {COLLECTIONS.map((c) => (
        <ChoiceCard key={c.key} name="collectionKey" value={c.key} checked={c.key === value} onSelect={onChange}>
          <CollectionSwatch collectionKey={c.key} fontPairKey={fontPairKey} names={coupleNames} />
          <span className="px-1">
            <span className="t-item block">{c.name}</span>
            <span className="t-meta block">{c.mood}</span>
          </span>
        </ChoiceCard>
      ))}
    </ChoiceGrid>
  );
}

export function FontPairPicker({
  value,
  onChange,
  coupleNames,
}: {
  value: string;
  onChange: (key: FontPairKey) => void;
  coupleNames: string;
}) {
  return (
    <ChoiceGrid>
      {(Object.keys(FONT_PAIRS) as FontPairKey[]).map((key) => {
        const f = FONT_PAIRS[key];
        return (
          <ChoiceCard key={key} name="fontPairKey" value={key} checked={key === value} onSelect={() => onChange(key)}>
            <span className="flex flex-col gap-1 rounded-lg bg-canvas px-3 py-3" aria-hidden>
              {/* Amostra da fonte do casal: tamanho fixo em rem porque e a arte, nao texto do painel. */}
              <span className="truncate text-[1.625rem] leading-none text-brand" style={{ fontFamily: f.script }}>
                {coupleNames}
              </span>
              <span className="truncate uppercase tracking-[0.12em]" style={{ fontFamily: f.display, fontSize: "1rem" }}>
                Nossa história
              </span>
            </span>
            <span className="t-item px-1">{f.name}</span>
          </ChoiceCard>
        );
      })}
    </ChoiceGrid>
  );
}

export type OrderItem<K extends string> = { key: K; enabled: boolean };

// Lista com liga/desliga e ordem. Mudar a ordem so mexe no rascunho.
export function OrderList<K extends string>({
  items,
  labels,
  onChange,
  canReorder = true,
}: {
  items: OrderItem<K>[];
  labels: Record<K, string>;
  onChange: (items: OrderItem<K>[]) => void;
  canReorder?: boolean;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  return (
    <ul className="divide-y divide-line rounded-xl border border-line">
      {items.map((s, i) => (
        <li key={s.key} className="flex items-center justify-between gap-3 px-3 py-2">
          <Checkbox
            label={labels[s.key]}
            checked={s.enabled}
            onChange={(e) => onChange(items.map((x) => (x.key === s.key ? { ...x, enabled: e.target.checked } : x)))}
          />
          {canReorder && (
            <div className="flex gap-0.5">
              <IconButton aria-label={`Subir ${labels[s.key]}`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp strokeWidth={1.5} />
              </IconButton>
              <IconButton aria-label={`Descer ${labels[s.key]}`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown strokeWidth={1.5} />
              </IconButton>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

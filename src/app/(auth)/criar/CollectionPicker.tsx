import { COLLECTIONS } from "@/collections";
import { CollectionCard } from "@/components/landing/CollectionCard";

// Radio visual: o input fica escondido e o cartao inteiro e o alvo do clique.
export function CollectionPicker({ name = "collectionKey" }: { name?: string }) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="t-label mb-2 text-ink">Coleção</legend>
      <div className="grid grid-cols-3 gap-3">
        {COLLECTIONS.map((c, i) => (
          <label key={c.key} className="cursor-pointer">
            <input type="radio" name={name} value={c.key} defaultChecked={i === 0} className="peer sr-only" />
            <div className="rounded-xl border-2 border-transparent p-1 transition peer-checked:border-brand peer-focus-visible:border-brand">
              <CollectionCard collection={c} names="A & P" />
            </div>
            <p className="t-label mt-1 text-center">{c.name}</p>
          </label>
        ))}
      </div>
      <p className="t-meta mt-2">Dá para trocar depois, no painel.</p>
    </fieldset>
  );
}

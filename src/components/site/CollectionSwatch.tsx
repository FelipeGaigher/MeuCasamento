import { getCollection, themeVars } from "@/collections";
import { Ornament } from "./Ornaments";

// Miniatura de uma colecao: papel, cores e nomes na fonte script.
export function CollectionSwatch({ collectionKey, fontPairKey, names }: { collectionKey: string; fontPairKey?: string | null; names: string }) {
  const c = getCollection(collectionKey);
  return (
    <div
      aria-hidden
      className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl"
      style={{ ...themeVars(c.key, fontPairKey), background: "var(--w-bg)" }}
    >
      <div
        className="relative flex h-24 w-[70%] flex-col items-center justify-center rounded-lg"
        style={{ background: "var(--w-paper)", boxShadow: "0 8px 18px -12px rgba(0,0,0,.4)" }}
      >
        <span className="text-[1.625rem] leading-none" style={{ fontFamily: "var(--w-script)", color: "var(--w-accent)" }}>
          {names}
        </span>
        <span className="mt-2 flex gap-1.5">
          {[c.palette.accent, c.palette.leaf, c.palette.line].map((color) => (
            <span key={color} className="size-3 rounded-full" style={{ background: color }} />
          ))}
        </span>
      </div>
      <Ornament kind={c.ornament} slot="corner" className="absolute -top-1 right-1 h-16 w-16" />
    </div>
  );
}

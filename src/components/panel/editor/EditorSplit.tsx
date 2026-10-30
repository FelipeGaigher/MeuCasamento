"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Segmented } from "@/components/ui";
import { cn } from "@/lib/cn";

// Formulario a esquerda, previa a direita, com barra arrastavel entre os dois.
// A largura da previa e de quem edita: fica salva por editor e respeita a tela.
// Abaixo de lg vira uma troca Editar / Previa.

export const PREVIEW_MIN = 360;
export const EDITOR_MIN = 420;
export const PREVIEW_DEFAULT = 520;
const STEP = 16;
const STEP_BIG = 64;

const clamp = (v: number, max: number) => Math.min(Math.max(v, PREVIEW_MIN), Math.max(max, PREVIEW_MIN));

function usePreviewWidth(storageKey: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(PREVIEW_DEFAULT);
  const [max, setMax] = useState(Number.POSITIVE_INFINITY);

  // Le depois da hidratacao: o servidor nao tem localStorage.
  useEffect(() => {
    try {
      const n = Number.parseInt(window.localStorage.getItem(storageKey) ?? "", 10);
      if (Number.isFinite(n)) setWidth(Math.max(n, PREVIEW_MIN));
    } catch {
      // armazenamento bloqueado: fica o padrao
    }
  }, [storageKey]);

  // O maximo depende da tela: largura do container menos o minimo do formulario.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setMax(Math.max(el.getBoundingClientRect().width - EDITOR_MIN, PREVIEW_MIN));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const set = useCallback(
    (v: number) => {
      const next = clamp(v, max);
      setWidth(next);
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {
        // so nesta sessao
      }
    },
    [max, storageKey],
  );

  // Sempre limita o que vai para o CSS: o valor salvo pode ter vindo de uma tela maior.
  return { containerRef, width: clamp(width, max), max, set };
}

function Splitter({
  containerRef,
  width,
  max,
  onWidth,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  width: number;
  max: number;
  onWidth: (v: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // A previa e a coluna da DIREITA: ponteiro para a esquerda alarga a previa.
  const move = (clientX: number) => {
    const el = containerRef.current;
    if (el) onWidth(el.getBoundingClientRect().right - clientX);
  };

  useEffect(() => {
    if (!dragging) return;
    const s = document.body.style;
    const prev = [s.cursor, s.userSelect] as const;
    s.cursor = "col-resize";
    s.userSelect = "none";
    return () => {
      s.cursor = prev[0];
      s.userSelect = prev[1];
    };
  }, [dragging]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? STEP_BIG : STEP;
    const map: Record<string, number> = { ArrowLeft: width + step, ArrowRight: width - step, Home: max, End: PREVIEW_MIN };
    if (e.key in map) {
      e.preventDefault();
      onWidth(map[e.key]);
    }
  };

  const stop = (e: React.PointerEvent) => {
    ref.current?.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label="Largura da prévia"
      aria-valuenow={Math.round(width)}
      aria-valuemin={PREVIEW_MIN}
      aria-valuemax={Math.round(max)}
      tabIndex={0}
      title="Arraste para mudar a largura da prévia. Dois cliques voltam ao padrão."
      className="group relative hidden w-2 shrink-0 cursor-col-resize touch-none self-stretch rounded-full outline-none lg:block"
      onPointerDown={(e) => {
        e.preventDefault();
        // Captura: o arraste continua mesmo passando por cima do iframe.
        ref.current?.setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={(e) => dragging && move(e.clientX)}
      onPointerUp={stop}
      onPointerCancel={stop}
      onDoubleClick={() => onWidth(PREVIEW_DEFAULT)}
      onKeyDown={onKeyDown}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full transition-colors group-hover:bg-brand group-focus-visible:bg-brand",
          dragging ? "bg-brand" : "bg-line",
        )}
      />
    </div>
  );
}

export function EditorSplit({
  editor,
  preview,
  storageKey,
}: {
  editor: ReactNode;
  preview: ReactNode;
  /** Uma chave POR editor, com prefixo do painel (ex.: "painel_site_previa_w"). */
  storageKey: string;
}) {
  const { containerRef, width, max, set } = usePreviewWidth(storageKey);
  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        label="Alternar entre editar e ver a prévia"
        className="lg:hidden"
        value={tab}
        onChange={setTab}
        options={[
          { key: "editor", label: "Editar" },
          { key: "preview", label: "Prévia" },
        ]}
      />
      <div
        ref={containerRef}
        style={{ "--preview-w": `${width}px` } as CSSProperties}
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_var(--preview-w)] lg:items-stretch lg:gap-3"
      >
        <div className={cn("min-w-0 flex-col gap-4", tab === "preview" ? "hidden lg:flex" : "flex")}>{editor}</div>
        <Splitter containerRef={containerRef} width={width} max={max} onWidth={set} />
        <div className={cn("min-w-0", tab === "editor" ? "hidden lg:block" : "block")}>{preview}</div>
      </div>
    </div>
  );
}

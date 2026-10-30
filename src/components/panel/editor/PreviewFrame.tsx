"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, RefreshCw, Smartphone } from "lucide-react";
import { IconButton, Segmented } from "@/components/ui";
import { EDITOR_SRC, PAGE_SRC, type CmsCopy } from "@/lib/cms";
import { formatTime } from "@/lib/dates";

// Previa ao vivo do painel: carrega a rota real (/previa/...) num iframe.
// Estrutura (colecao, fontes, secoes, foto) vai na URL e recarrega a previa;
// texto vai por postMessage enquanto o casal digita, sem salvar nada.

const DEVICES = {
  celular: { label: "Celular", width: 390, Icon: Smartphone },
  computador: { label: "Computador", width: 1280, Icon: Monitor },
} as const;
type Device = keyof typeof DEVICES;

const URL_DELAY = 600;
const COPY_DELAY = 120;

type Props = {
  route: string;
  query: Record<string, string>;
  copy: CmsCopy;
  reloadKey: number;
  openHref: string;
  title: string;
};

export function PreviewFrame({ route, query, copy, reloadKey, openHref, title }: Props) {
  const [device, setDevice] = useState<Device>("celular"); // a maioria dos convidados abre no celular
  const [reloads, setReloads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // URL so muda depois de uma pausa: trocar a ordem das secoes nao recarrega a cada clique.
  const target = `${route}?${new URLSearchParams(query).toString()}`;
  const [src, setSrc] = useState(target);
  useEffect(() => {
    if (target === src) return;
    const t = window.setTimeout(() => setSrc(target), URL_DELAY);
    return () => window.clearTimeout(t);
  }, [target, src]);

  const frameKey = `${reloadKey}-${reloads}-${src}`;
  useEffect(() => setLoading(true), [frameKey]);

  const copyRef = useRef(copy);
  useEffect(() => {
    copyRef.current = copy;
  }, [copy]);
  const send = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ src: EDITOR_SRC, type: "draft", copy: copyRef.current }, window.location.origin);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(send, COPY_DELAY);
    return () => window.clearTimeout(t);
  }, [copy, send]);

  // A pagina avisa "ready" ao montar (e de novo a cada recarga) e pede foco num campo ao clicar num texto.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.src !== PAGE_SRC) return;
      if (e.data.type === "ready") send();
      if (e.data.type === "focus" && typeof e.data.path === "string") focusField(e.data.path);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  // Escala para caber na coluna; so a largura e do aparelho, a altura e a da caixa.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox({ width: Math.max(r.width - 24, 40), height: Math.max(r.height - 12, 120) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cfg = DEVICES[device];
  const scale = box.width > 0 ? Math.min(box.width / cfg.width, 1) : 1; // nunca aumenta
  const virtualHeight = box.height / scale;
  const left = Math.max(0, (box.width - cfg.width * scale) / 2) + 12;

  return (
    <div className="flex h-[70dvh] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:sticky lg:top-[68px] lg:h-[calc(100dvh-84px)]">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="t-item flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-ok" aria-hidden />
          <span className="truncate">{title}</span>
        </p>
        <div className="flex items-center gap-1">
          <IconButton aria-label="Recarregar prévia" title="Recarregar prévia" onClick={() => setReloads((n) => n + 1)}>
            <RefreshCw strokeWidth={1.5} />
          </IconButton>
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir a página salva em nova aba"
            aria-label="Abrir a página salva em nova aba"
            // sem-plastico-ignore: icone-em-caixa — botao de ferramenta: fundo so no hover, area de clique de 32px
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand/5 hover:text-ink"
          >
            <ExternalLink className="size-4" strokeWidth={1.5} />
          </a>
          <Segmented
            label="Tamanho da prévia"
            className="ml-1"
            value={device}
            onChange={setDevice}
            options={(Object.keys(DEVICES) as Device[]).map((key) => {
              const d = DEVICES[key];
              return {
                key,
                title: d.label,
                label: (
                  <>
                    <d.Icon strokeWidth={1.5} aria-hidden />
                    <span className="hidden 2xl:inline">{d.label}</span>
                    <span className="sr-only 2xl:hidden">{d.label}</span>
                  </>
                ),
              };
            })}
          />
        </div>
      </div>

      <div ref={viewportRef} className="relative min-h-0 flex-1 overflow-hidden bg-canvas">
        <div
          style={{
            position: "absolute",
            top: 12,
            left,
            width: cfg.width,
            height: virtualHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            key={frameKey}
            ref={iframeRef}
            src={src}
            title={title}
            onLoad={() => {
              setLoading(false);
              setLoadedAt(new Date());
              send();
            }}
            className="h-full w-full rounded-md border-0 bg-surface shadow-card"
          />
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-canvas/70" role="status">
            <p className="t-meta flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 shadow-card">
              <RefreshCw className="size-3.5 animate-spin" strokeWidth={1.5} aria-hidden />
              Carregando a prévia...
            </p>
          </div>
        )}
      </div>

      <p className="t-meta border-t border-line px-3 py-2">
        O texto muda enquanto você digita. Coleção, fontes e seções recarregam a prévia.
        {loadedAt && ` Recarregada às ${formatTime(loadedAt)}.`} Clique num texto da prévia para editar o campo.
      </p>
    </div>
  );
}

// Abre o campo do formulario que corresponde ao texto clicado na previa.
function focusField(path: string) {
  const field = document.querySelector<HTMLElement>(`[data-cms-field="${CSS.escape(path)}"]`);
  if (!field) return;
  field.closest("details")?.setAttribute("open", "");
  field.scrollIntoView({ behavior: "smooth", block: "center" });
  field.focus({ preventScroll: true });
  field.classList.add("is-cms-focused");
  window.setTimeout(() => field.classList.remove("is-cms-focused"), 1600);
}

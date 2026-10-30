"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveInlineCopy } from "@/server/cms-actions";
import { EDITOR_SRC, PAGE_SRC, readCopy, splitNames } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

// Camada de texto das paginas do casal (site e convite). As secoes continuam
// Server Components e chegam como children: este provider nunca reconcilia
// esse trecho, entao pode escrever no DOM dos nos [data-cms-path].
//
// mode="preview": dentro do iframe do painel. Recebe o rascunho por
//   postMessage, escreve o texto e avisa o painel do clique num texto.
// mode="inline": o casal logado na propria pagina. Tecla E liga a edicao,
//   Ctrl+S salva, Esc sai do campo.

const NODES = "[data-cms-path]";

type Props = { mode: "preview" | "inline"; slug: string; children: React.ReactNode };

function pathOf(el: HTMLElement) {
  return el.dataset.cmsPath ?? "";
}

// Escreve o valor no no, respeitando texto padrao, campo opcional e nomes em duas linhas.
function writeNode(el: HTMLElement, value: string) {
  const empty = value.trim() === "";
  const shown = empty ? (el.dataset.cmsFallback ?? "") : value;
  if ("cmsOptional" in el.dataset) boxOf(el).hidden = empty;
  if (el.dataset.cmsFormat === "names") {
    const spans = splitNames(shown)
      .filter((t): t is string => !!t)
      .map((t) => {
        const span = document.createElement("span");
        span.className = "block";
        span.textContent = t;
        return span;
      });
    el.replaceChildren(...spans);
    return;
  }
  if (el.textContent !== shown) el.textContent = shown;
}

// Campo opcional some junto com a caixa em volta dele, quando existe.
function boxOf(el: HTMLElement) {
  return el.closest<HTMLElement>("[data-cms-box]") ?? el;
}

// textContent, nao innerText: innerText devolve o texto ja transformado pelo CSS (uppercase).
function readNode(el: HTMLElement) {
  if (el.dataset.cmsFormat === "names") {
    const parts = el.children.length ? Array.from(el.children, (c) => c.textContent ?? "") : [el.textContent ?? ""];
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
  return (el.textContent ?? "").replace(/\n+$/, "");
}

function nodes() {
  return Array.from(document.querySelectorAll<HTMLElement>(NODES));
}

export function CmsCopyProvider({ mode, slug, children }: Props) {
  return (
    <>
      {children}
      {mode === "preview" ? <PreviewReceiver /> : <InlineEditor slug={slug} />}
    </>
  );
}

function PreviewReceiver() {
  useEffect(() => {
    const origin = window.location.origin;
    document.documentElement.classList.add("cms-preview");

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin || e.data?.src !== EDITOR_SRC || e.data.type !== "draft") return;
      const copy = readCopy(e.data.copy);
      if (!copy) return;
      for (const el of nodes()) {
        const path = pathOf(el);
        if (path in copy) writeNode(el, copy[path]);
      }
    };

    // Clique num texto abre o campo no painel. Link e envio de formulario nao navegam.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const node = target?.closest<HTMLElement>(NODES);
      if (node) {
        e.preventDefault();
        e.stopPropagation();
        node.classList.add("is-cms-picked");
        window.setTimeout(() => node.classList.remove("is-cms-picked"), 1600);
        window.parent.postMessage({ src: PAGE_SRC, type: "focus", path: pathOf(node) }, origin);
        return;
      }
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (link && !link.getAttribute("href")?.startsWith("#")) e.preventDefault();
    };
    const onSubmit = (e: Event) => e.preventDefault();

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    if (window.parent !== window) window.parent.postMessage({ src: PAGE_SRC, type: "ready" }, origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}

type Status = "idle" | "saving" | "saved" | "error";

function InlineEditor({ slug }: { slug: string }) {
  const [editing, setEditing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  // Fila em ref: o Ctrl+S tira o foco e salva no tique seguinte, e precisa ver o texto do blur.
  const pending = useRef(new Map<string, string>());
  const originals = useRef(new Map<string, string>());

  const register = useCallback((el: HTMLElement) => {
    const path = pathOf(el);
    const text = readNode(el);
    if (text === originals.current.get(path)) pending.current.delete(path);
    else pending.current.set(path, text);
    setPendingCount(pending.current.size);
    if (pending.current.size) setStatus("idle");
  }, []);

  const save = useCallback(async () => {
    if (!pending.current.size) return;
    const snapshot = Object.fromEntries(pending.current);
    setStatus("saving");
    const result = await saveInlineCopy(slug, snapshot).catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    if (result?.ok) {
      for (const [path, text] of Object.entries(snapshot)) {
        originals.current.set(path, text);
        if (pending.current.get(path) === text) pending.current.delete(path);
      }
      setPendingCount(pending.current.size);
      setStatus("saved");
      setMessage("Textos salvos.");
    } else {
      setStatus("error");
      setMessage(result?.error ?? "Não foi possível salvar.");
    }
  }, [slug]);

  const discard = useCallback(() => {
    for (const el of nodes()) {
      const path = pathOf(el);
      if (pending.current.has(path)) writeNode(el, originals.current.get(path) ?? "");
    }
    pending.current.clear();
    setPendingCount(0);
    setStatus("idle");
  }, []);

  // Liga e desliga a edicao nos nos marcados.
  useEffect(() => {
    document.documentElement.classList.toggle("cms-editing", editing);
    for (const el of nodes()) {
      const path = pathOf(el);
      if (editing) {
        if (!originals.current.has(path)) originals.current.set(path, readNode(el));
        try {
          el.contentEditable = "plaintext-only";
        } catch {
          el.contentEditable = "true";
        }
        el.spellcheck = false;
        if ("cmsOptional" in el.dataset) boxOf(el).hidden = false;
      } else {
        el.removeAttribute("contenteditable");
        if ("cmsOptional" in el.dataset) boxOf(el).hidden = readNode(el).trim() === "";
      }
    }
  }, [editing]);

  // Atalhos e eventos de edicao, todos na fase de captura do documento.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = !!target?.closest("input, textarea, select, [contenteditable]");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && pending.current.size + (editing ? 1 : 0) > 0) {
        e.preventDefault();
        (document.activeElement as HTMLElement | null)?.blur();
        window.setTimeout(save, 0);
        return;
      }
      if (target?.matches(NODES) && target.isContentEditable) {
        if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey && !("cmsMultiline" in target.dataset))) {
          e.preventDefault();
          target.blur();
        }
        return;
      }
      if (e.key === "e" && !e.ctrlKey && !e.metaKey && !e.altKey && !inField) {
        e.preventDefault();
        setEditing((v) => !v);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.matches(NODES) && el.isContentEditable) register(el);
    };
    const onClick = (e: MouseEvent) => {
      if (!editing) return;
      const link = (e.target as HTMLElement | null)?.closest("a[href]");
      if (link) e.preventDefault();
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [editing, register, save]);

  useEffect(() => {
    if (!pendingCount) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [pendingCount]);

  const note =
    status === "saving"
      ? "Salvando..."
      : status === "saved" || status === "error"
        ? message
        : pendingCount
          ? `${pendingCount} ${pendingCount === 1 ? "texto alterado" : "textos alterados"}`
          : "Clique num texto para mudar.";

  return (
    <div
      role="region"
      aria-label="Edição dos textos"
      className="t-body fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-2 text-ink shadow-lg"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {editing || pendingCount ? (
        <>
          <p className={cn("t-meta px-2", status === "error" && "text-danger", status === "saved" && "text-ok")} aria-live="polite">
            {note}
          </p>
          {pendingCount > 0 && (
            <Button type="button" variant="ghost" onClick={discard} className="h-9">
              Descartar
            </Button>
          )}
          <Button type="button" onClick={save} disabled={!pendingCount || status === "saving"} className="h-9">
            Salvar <kbd className="opacity-70">Ctrl+S</kbd>
          </Button>
          <Button type="button" variant="secondary" onClick={() => setEditing((v) => !v)} className="h-9">
            {editing ? "Sair da edição" : "Editar textos"}
          </Button>
        </>
      ) : (
        <Button type="button" variant="ghost" onClick={() => setEditing(true)} className="h-9">
          Editar textos <kbd className="rounded border border-line px-1.5 text-muted">E</kbd>
        </Button>
      )}
    </div>
  );
}

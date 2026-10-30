"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { pub } from "./styles";

type Status = "PENDENTE" | "PAGO" | "CANCELADO" | "ESTORNADO";

export function PixPanel({
  orderId,
  slug,
  initialStatus,
  copyPaste,
  qrBase64,
  demo,
}: {
  orderId: string;
  slug: string;
  initialStatus: Status;
  copyPaste: string | null;
  qrBase64: string | null;
  demo: boolean;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (status !== "PENDENTE") return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" }).catch(() => null);
      if (res?.ok) setStatus((await res.json()).status);
    }, 5000);
    return () => clearInterval(t);
  }, [orderId, status]);

  if (status === "PAGO") {
    return (
      <div className="text-center">
        <p className={pub.kicker}>Muito obrigado!</p>
        <p className={`${pub.body} mt-2`}>Seu presente foi confirmado e o casal já foi avisado.</p>
        <Link href={`/${slug}`} className={`${pub.buttonGhost} mt-6`}>Voltar ao site</Link>
      </div>
    );
  }
  if (status !== "PENDENTE") {
    return <p className={`${pub.body} text-center`}>Este pedido foi {status === "ESTORNADO" ? "estornado" : "cancelado"}.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className={pub.body}>Pague com Pix pelo QR Code ou pelo código copia e cola.</p>
      {qrBase64 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code do Pix" className="size-56 rounded-lg bg-white p-2" />
      )}
      {copyPaste && (
        <>
          <textarea readOnly value={copyPaste} rows={3} className={`${pub.input} break-all`} aria-label="Código Pix copia e cola" />
          <button
            type="button"
            className={pub.button}
            onClick={async () => {
              await navigator.clipboard.writeText(copyPaste).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Código copiado!" : "Copiar código Pix"}
          </button>
        </>
      )}
      <p className={pub.muted}>Esta página se atualiza sozinha quando o pagamento for confirmado.</p>
      {demo && (
        <div className="mt-2 w-full rounded-lg border border-dashed border-[var(--w-line)] p-4">
          <p className={pub.muted}>Modo demonstração: nenhum pagamento real é cobrado.</p>
          <button
            type="button"
            disabled={simulating}
            className={`${pub.buttonGhost} mt-3`}
            onClick={async () => {
              setSimulating(true);
              const res = await fetch(`/api/orders/${orderId}/simular`, { method: "POST" }).catch(() => null);
              if (res?.ok) setStatus("PAGO");
              setSimulating(false);
            }}
          >
            {simulating ? "Simulando..." : "Simular pagamento"}
          </button>
        </div>
      )}
    </div>
  );
}

import { ImageResponse } from "next/og";
import { getCollection } from "@/collections";
import { formatDayMonthYear, loadPublicWedding } from "@/components/site/data";
import { formatTime } from "@/lib/dates";

// Previa do link no WhatsApp e nas redes: nomes, data e local nas cores da colecao.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Convite de casamento";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  const names = data?.wedding.coupleNames ?? "Meu Casamento";
  const first = data?.events[0];
  const p = getCollection(data?.wedding.site?.collectionKey ?? data?.wedding.invitation?.collectionKey).palette;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: p.bg,
          padding: 48,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: p.paper,
            border: `2px solid ${p.line}`,
            borderRadius: 28,
            color: p.ink,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: 36, right: 52, display: "flex", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 34, background: p.accent }} />
            <div style={{ width: 34, height: 34, borderRadius: 34, background: p.accent, marginTop: 14 }} />
          </div>
          <div style={{ fontSize: 28, letterSpacing: 10, textTransform: "uppercase", color: p.muted }}>Vamos casar</div>
          <div style={{ fontSize: 96, color: p.accent, marginTop: 18, fontStyle: "italic", textAlign: "center", lineHeight: 1.05 }}>
            {names}
          </div>
          <div style={{ width: 220, height: 2, background: p.accent, opacity: 0.5, marginTop: 30 }} />
          {first && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 26 }}>
              <div style={{ fontSize: 40 }}>{`${formatDayMonthYear(first.startsAt)} · ${formatTime(first.startsAt)}`}</div>
              <div style={{ fontSize: 30, color: p.muted, marginTop: 10 }}>{first.venueName}</div>
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}

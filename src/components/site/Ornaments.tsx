// Arte decorativa por colecao, desenhada em SVG com as cores do tema (--w-*).
// Tudo aqui e aria-hidden e fica fora da area de texto.

export type OrnamentKind = "cereja" | "oliva" | "mar";
export type OrnamentSlot = "corner" | "side" | "divider" | "seal";

const A = "var(--w-accent)";
const L = "var(--w-leaf)";
const P = "var(--w-paper)";
const I = "var(--w-accent-ink)";

function Leaf({ x, y, r, s = 1 }: { x: number; y: number; r: number; s?: number }) {
  return (
    <path
      d="M0 0 C 6 -10, 22 -12, 30 0 C 22 12, 6 10, 0 0 Z"
      transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
      fill={L}
      opacity={0.9}
    />
  );
}

function Cherry({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="0" r="11" fill={A} />
      <circle cx="-3.5" cy="-3.5" r="3" fill={P} opacity={0.35} />
    </g>
  );
}

function Blossom({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="0" cy="-8" rx="5.5" ry="8" fill={A} opacity={0.55} transform={`rotate(${r})`} />
      ))}
      <circle r="3" fill={A} />
    </g>
  );
}

function CherryCluster() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <path d="M70 18 C 62 40, 48 58, 38 82" stroke={L} strokeWidth="2" fill="none" />
      <path d="M70 18 C 74 44, 72 64, 66 88" stroke={L} strokeWidth="2" fill="none" />
      <Leaf x={70} y={18} r={-30} s={1.3} />
      <Leaf x={70} y={20} r={200} s={1.1} />
      <Cherry x={38} y={90} />
      <Cherry x={66} y={96} />
      <Blossom x={100} y={60} s={0.9} />
    </svg>
  );
}

function OliveBranch({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M10 110 C 40 80, 70 50, 112 12" stroke={L} strokeWidth="2" fill="none" />
      <Leaf x={28} y={92} r={-120} />
      <Leaf x={34} y={86} r={10} />
      <Leaf x={52} y={70} r={-115} />
      <Leaf x={58} y={64} r={15} />
      <Leaf x={76} y={48} r={-110} />
      <Leaf x={82} y={42} r={20} />
      <Leaf x={98} y={26} r={-100} s={0.8} />
      <ellipse cx="66" cy="72" rx="4" ry="5.5" fill={A} opacity={0.8} />
      <ellipse cx="90" cy="48" rx="4" ry="5.5" fill={A} opacity={0.8} />
    </svg>
  );
}

function Shell({ x = 60, y = 64, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 22 C -26 18, -30 -10, 0 -24 C 30 -10, 26 18, 0 22 Z" fill={L} opacity={0.85} />
      {[-18, -9, 0, 9, 18].map((dx) => (
        <path key={dx} d={`M0 20 L ${dx} -18`} stroke={P} strokeWidth="1.5" opacity={0.7} />
      ))}
    </g>
  );
}

function Waves() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      {[30, 52, 74].map((y, i) => (
        <path
          key={y}
          d={`M4 ${y} q 14 -12 28 0 t 28 0 t 28 0 t 28 0`}
          stroke={A}
          strokeWidth={2 - i * 0.4}
          fill="none"
          opacity={0.75 - i * 0.18}
        />
      ))}
      <Shell x={84} y={98} s={0.7} />
    </svg>
  );
}

function WaxSeal() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      <path
        d="M40 4 C 52 2, 60 10, 68 14 C 76 22, 78 30, 76 42 C 78 54, 70 62, 62 70 C 52 78, 42 76, 32 76 C 20 76, 12 68, 8 58 C 2 48, 4 36, 6 26 C 10 14, 26 6, 40 4 Z"
        fill={A}
      />
      <circle cx="40" cy="40" r="25" fill="none" stroke={I} strokeOpacity={0.35} strokeWidth="1.5" />
      <circle cx="34" cy="42" r="9" fill="none" stroke={I} strokeOpacity={0.85} strokeWidth="2.2" />
      <circle cx="46" cy="42" r="9" fill="none" stroke={I} strokeOpacity={0.85} strokeWidth="2.2" />
    </svg>
  );
}

function Wreath() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      <circle cx="40" cy="40" r="26" fill="none" stroke={L} strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => i * 30).map((r) => (
        <g key={r} transform={`rotate(${r} 40 40)`}>
          <Leaf x={40} y={14} r={-20} s={0.45} />
        </g>
      ))}
      <circle cx="35" cy="42" r="7" fill="none" stroke={A} strokeWidth="2" />
      <circle cx="45" cy="42" r="7" fill="none" stroke={A} strokeWidth="2" />
    </svg>
  );
}

function Divider({ kind }: { kind: OrnamentKind }) {
  return (
    <svg viewBox="0 0 160 24" className="h-full w-full">
      <line x1="4" y1="12" x2="60" y2="12" stroke={A} strokeOpacity={0.5} />
      <line x1="100" y1="12" x2="156" y2="12" stroke={A} strokeOpacity={0.5} />
      {kind === "cereja" && (
        <g>
          <path d="M80 2 C 76 8, 72 12, 70 16 M80 2 C 82 8, 86 12, 90 16" stroke={L} strokeWidth="1.5" fill="none" />
          <circle cx="70" cy="17" r="5" fill={A} />
          <circle cx="90" cy="17" r="5" fill={A} />
        </g>
      )}
      {kind === "oliva" && (
        <g>
          <Leaf x={80} y={12} r={-160} s={0.6} />
          <Leaf x={80} y={12} r={-20} s={0.6} />
          <circle cx="80" cy="12" r="2.5" fill={A} />
        </g>
      )}
      {kind === "mar" && (
        <path d="M64 12 q 4 -6 8 0 t 8 0 t 8 0 t 8 0" stroke={A} strokeWidth="1.6" fill="none" />
      )}
    </svg>
  );
}

function Side({ kind }: { kind: OrnamentKind }) {
  if (kind === "oliva") {
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="h-48 w-48"><OliveBranch /></div>
        <div className="h-40 w-40 self-end"><OliveBranch flip /></div>
      </div>
    );
  }
  if (kind === "mar") {
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="h-44 w-52"><Waves /></div>
        <div className="h-40 w-40 self-end"><Waves /></div>
      </div>
    );
  }
  return (
    <div className="relative flex h-full flex-col justify-between">
      <svg viewBox="0 0 60 400" preserveAspectRatio="none" className="absolute inset-y-0 left-1/2 h-full w-16 -translate-x-1/2">
        <path d="M30 0 C 60 60, 0 120, 30 180 C 60 240, 0 300, 30 400" stroke={A} strokeWidth="6" fill="none" opacity={0.55} strokeLinecap="round" />
      </svg>
      <div className="relative h-44 w-44"><CherryCluster /></div>
      <div className="relative h-40 w-40 self-end"><CherryCluster /></div>
    </div>
  );
}

export function Ornament({ kind, slot, className }: { kind: OrnamentKind; slot: OrnamentSlot; className?: string }) {
  let art: React.ReactNode;
  if (slot === "divider") art = <Divider kind={kind} />;
  else if (slot === "seal") art = kind === "cereja" ? <WaxSeal /> : kind === "oliva" ? <Wreath /> : <svg viewBox="0 0 120 120" className="h-full w-full"><Shell s={1.6} /></svg>;
  else if (slot === "side") art = <Side kind={kind} />;
  else art = kind === "cereja" ? <CherryCluster /> : kind === "oliva" ? <OliveBranch /> : <Waves />;
  return (
    <div aria-hidden className={className} style={{ pointerEvents: "none" }}>
      {art}
    </div>
  );
}

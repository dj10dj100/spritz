// Hand-drawn poster motifs (1970s Campari ad vibe), sparse and faded so the
// leaderboard stays the hero. Server-rendered SVG; no JS, no images.
export default function BackgroundMotifs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      <Motif className="left-[4%] top-[6%] w-16 sm:w-20" tilt={-8} color="aperol">
        <AperolBottle />
      </Motif>
      <Motif className="right-[5%] top-[3%] w-24 sm:w-28" tilt={12} color="aperol">
        <Sun />
      </Motif>
      <Motif className="right-[7%] top-[42%] w-20 sm:w-24" tilt={-6} color="aperol">
        <SpritzGlass />
      </Motif>
      <Motif className="left-[6%] top-[58%] w-16 sm:w-20" tilt={14} color="bottle">
        <Lemon />
      </Motif>
      <Motif className="right-[6%] bottom-[16%] w-24 sm:w-28" tilt={-10} color="bottle">
        <Cypress />
      </Motif>
      <Motif className="left-[4%] bottom-[8%] w-28 sm:w-32" tilt={4} color="aperol">
        <Vespa />
      </Motif>
    </div>
  );
}

type Color = "aperol" | "bottle";

function Motif({
  className,
  tilt,
  color,
  children,
}: {
  className: string;
  tilt: number;
  color: Color;
  children: React.ReactNode;
}) {
  const colorVar = color === "aperol" ? "var(--color-aperol)" : "var(--color-bottle)";
  return (
    <div
      className={`absolute ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        color: colorVar,
        opacity: 0.1,
      }}
    >
      {children}
    </div>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function AperolBottle() {
  return (
    <svg viewBox="0 0 60 140" {...stroke} className="h-auto w-full">
      <path d="M26 6 H34 V14 H26 Z" />
      <path d="M22 14 H38 V24 Q38 30 36 32 Q34 34 34 38 V124 Q34 134 30 134 Q26 134 26 124 V38 Q26 34 24 32 Q22 30 22 24 Z" />
      <rect x="25" y="56" width="10" height="38" rx="1" />
      <line x1="27" y1="68" x2="33" y2="68" />
      <line x1="27" y1="76" x2="33" y2="76" />
      <line x1="27" y1="84" x2="33" y2="84" />
    </svg>
  );
}

function SpritzGlass() {
  return (
    <svg viewBox="0 0 70 110" {...stroke} className="h-auto w-full">
      <path d="M8 14 H62 L48 56 Q35 66 22 56 Z" />
      <line x1="35" y1="62" x2="35" y2="96" />
      <line x1="18" y1="96" x2="52" y2="96" />
      <circle cx="40" cy="30" r="3.5" />
      <path d="M40 26 Q42 18 48 18" />
      <line x1="22" y1="42" x2="48" y2="42" />
    </svg>
  );
}

function Sun() {
  const rays = Array.from({ length: 12 });
  return (
    <svg viewBox="0 0 100 100" {...stroke} className="h-auto w-full">
      <circle cx="50" cy="50" r="18" />
      {rays.map((_, i) => {
        const angle = (i * Math.PI * 2) / rays.length;
        const x1 = 50 + Math.cos(angle) * 26;
        const y1 = 50 + Math.sin(angle) * 26;
        const x2 = 50 + Math.cos(angle) * 38;
        const y2 = 50 + Math.sin(angle) * 38;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </svg>
  );
}

function Lemon() {
  return (
    <svg viewBox="0 0 100 100" {...stroke} className="h-auto w-full">
      <circle cx="50" cy="50" r="36" />
      <circle cx="50" cy="50" r="28" />
      <line x1="50" y1="22" x2="50" y2="78" />
      <line x1="22" y1="50" x2="78" y2="50" />
      <line x1="30" y1="30" x2="70" y2="70" />
      <line x1="70" y1="30" x2="30" y2="70" />
    </svg>
  );
}

function Cypress() {
  return (
    <svg viewBox="0 0 60 140" {...stroke} className="h-auto w-full">
      <path d="M30 8 Q14 40 14 76 Q14 108 30 124 Q46 108 46 76 Q46 40 30 8 Z" />
      <line x1="30" y1="124" x2="30" y2="138" />
    </svg>
  );
}

function Vespa() {
  return (
    <svg viewBox="0 0 140 90" {...stroke} className="h-auto w-full">
      <circle cx="28" cy="68" r="12" />
      <circle cx="28" cy="68" r="4" />
      <circle cx="112" cy="68" r="12" />
      <circle cx="112" cy="68" r="4" />
      <path d="M28 68 Q28 36 56 36 L74 22 L96 22 L106 36 Q120 38 116 56 L112 68" />
      <path d="M96 22 L112 6 L122 6" />
      <path d="M56 36 Q70 50 96 50" />
    </svg>
  );
}

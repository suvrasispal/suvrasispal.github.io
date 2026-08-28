// Shared brand logo SVG components — single source of truth for Navbar, Footer, and Brand Book.
// All paths, clip polygons, transforms, and text metrics are taken verbatim from the
// official SVG files in src/imports/ (v2, August 2026).
//
// Official variants (matching the SVG files):
//   "on-dark"    = white N + purple hairlines + white NEXYRA + #2563EB CONSULTING  (dark bg)
//   "on-light"   = black N + purple hairlines + black NEXYRA + #2563EB CONSULTING  (light bg)
//   "gradient"   = gradient N + purple hairlines + white NEXYRA + white CONSULTING (dark bg only)
//   "mono-white" = all white
//   "mono-black" = all black
//
// Legacy aliases (kept for backward compat):
//   "white" → mono-white   "mono" → mono-black   "dark" → on-light
//
// Configurations:
//   NMonogramSVG         — 200 × 160 viewBox (mark only, no type)
//   HorizontalLockupSVG  — 400 × 104 viewBox  (v2: was 320 × 104)
//   VerticalLockupSVG    — 292 × 226 viewBox  (v2: replaces 240 × 180 stacked)
//   StackedLockupSVG     — alias for VerticalLockupSVG (backward compat)

export type LogoVariant =
  | "gradient"
  | "on-dark"
  | "on-light"
  | "mono-white"
  | "mono-black"
  | "white"
  | "mono"
  | "dark";

// ── Shared N path (verbatim from official SVGs) ───────────────────────────────
const N_PATH = "M0 140 L0 0 L26 0 L94 96 L94 0 L120 0 L120 140 L94 140 L26 44 L26 140 Z";

// ── Shared clip polygons (verbatim from official SVGs) ────────────────────────
const CLIP_TOP_PTS = "-40,120 160,22 160,-70 -40,-70";
const CLIP_BOT_PTS = "-40,130 160,32 160,230 -40,230";

// ── Font stack (v2: Hanken Grotesk, verbatim from official SVGs) ──────────────
const FONT = "'Hanken Grotesk','Neue Haas Grotesk Display','Helvetica Neue',Arial,sans-serif";

// ── Color resolver ────────────────────────────────────────────────────────────
function resolveColors(variant: LogoVariant, gradId: string) {
  const v =
    variant === "white" ? "mono-white"
    : variant === "mono" ? "mono-black"
    : variant === "dark" ? "on-light"
    : variant;

  switch (v) {
    case "on-dark":
      return { nFill: "#FFFFFF", hair: "#9333EA", wordmark: "#FFFFFF", sub: "#2563EB", isGradient: false };
    case "on-light":
      return { nFill: "#000000", hair: "#9333EA", wordmark: "#000000", sub: "#2563EB", isGradient: false };
    case "mono-white":
      return { nFill: "#FFFFFF", hair: "#FFFFFF", wordmark: "#FFFFFF", sub: "#FFFFFF", isGradient: false };
    case "mono-black":
      return { nFill: "#000000", hair: "#000000", wordmark: "#000000", sub: "#000000", isGradient: false };
    default: // gradient — dark backgrounds only
      return { nFill: `url(#${gradId})`, hair: "#9333EA", wordmark: "#FFFFFF", sub: "#FFFFFF", isGradient: true };
  }
}

// ── Gradient defs ─────────────────────────────────────────────────────────────
// gradientUnits="userSpaceOnUse" x1=0 y1=0 x2=130 y2=130 (verbatim from SVGs)
// Three-stop ramp: 0 → #A78BFA, 0.39 → #7C3AED, 1 → #3B82F6
function GradientDef({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="130" y2="130">
      <stop offset="0" stopColor="#A78BFA" />
      <stop offset="0.39" stopColor="#7C3AED" />
      <stop offset="1" stopColor="#3B82F6" />
    </linearGradient>
  );
}

// ── N Monogram ────────────────────────────────────────────────────────────────
// viewBox 0 0 200 160 — aspect ratio 5:4.
// width = size, height = size × 0.8.
export function NMonogramSVG({
  size = 64,
  variant = "gradient",
}: {
  size?: number;
  variant?: LogoVariant;
}) {
  const id = `nm-${variant}-${size}`;
  const { nFill, hair, isGradient } = resolveColors(variant, id);

  return (
    <svg
      width={size}
      height={Math.round(size * 0.8)}
      viewBox="0 0 200 160"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NEXYRA Consulting N monogram"
    >
      <defs>
        {isGradient && <GradientDef id={id} />}
        <clipPath id={`ct-${id}`}>
          <polygon points={CLIP_TOP_PTS} />
        </clipPath>
        <clipPath id={`cb-${id}`}>
          <polygon points={CLIP_BOT_PTS} />
        </clipPath>
      </defs>
      <g transform="translate(40,10)">
        <g clipPath={`url(#ct-${id})`}>
          <path fill={nFill} d={N_PATH} />
        </g>
        <g clipPath={`url(#cb-${id})`}>
          <path fill={nFill} d={N_PATH} />
        </g>
        <line stroke={hair} strokeWidth="4" strokeLinecap="round" x1="-30" y1="115" x2="-2" y2="101" />
        <line stroke={hair} strokeWidth="4" strokeLinecap="round" x1="122" y1="41" x2="150" y2="27" />
      </g>
    </svg>
  );
}

// ── Horizontal Lockup ─────────────────────────────────────────────────────────
// viewBox 0 0 400 104 (v2 — was 320 × 104).
// Text metrics verbatim from lockup-horizontal-*.svg files:
//   NEXYRA:     x=138   y=57.1  size=51   weight=500  tracking=5.33
//   CONSULTING: x=140.7 y=84.0  size=16.1 weight=400  tracking=9.67
export function HorizontalLockupSVG({
  width = 400,
  variant = "gradient",
}: {
  width?: number;
  variant?: LogoVariant;
}) {
  const id = `hl-${variant}-${width}`;
  const { nFill, hair, wordmark, sub, isGradient } = resolveColors(variant, id);
  const showLightBg = variant === "on-light" || variant === "dark";

  return (
    <svg
      width={width}
      height={Math.round(104 * (width / 400))}
      viewBox="0 0 400 104"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NEXYRA Consulting horizontal lockup"
    >
      <defs>
        {isGradient && <GradientDef id={id} />}
        <clipPath id={`ct-${id}`}>
          <polygon points={CLIP_TOP_PTS} />
        </clipPath>
        <clipPath id={`cb-${id}`}>
          <polygon points={CLIP_BOT_PTS} />
        </clipPath>
      </defs>
      {showLightBg && <rect width="400" height="104" fill="white" rx="6" />}
      <g transform="translate(34,20) scale(0.457)">
        <g clipPath={`url(#ct-${id})`}>
          <path fill={nFill} d={N_PATH} />
        </g>
        <g clipPath={`url(#cb-${id})`}>
          <path fill={nFill} d={N_PATH} />
        </g>
        <line stroke={hair} strokeWidth="4" strokeLinecap="round" x1="-30" y1="115" x2="-2" y2="101" />
        <line stroke={hair} strokeWidth="4" strokeLinecap="round" x1="122" y1="41" x2="150" y2="27" />
      </g>
      <text x="138" y="57.1" fontFamily={FONT} fontSize="51" fontWeight="500" letterSpacing="5.33" fill={wordmark}>
        NEXYRA
      </text>
      <text x="140.7" y="84.0" fontFamily={FONT} fontSize="16.1" fontWeight="400" letterSpacing="9.67" fill={sub}>
        CONSULTING
      </text>
    </svg>
  );
}

// ── Vertical Lockup ───────────────────────────────────────────────────────────
// viewBox 0 0 292 226 (v2 — replaces 240 × 180 stacked lockup).
// N scaled to 0.73 centred at translate(102.2,20).
// Text metrics verbatim from lockup-vertical-*.svg files:
//   NEXYRA:     x=148.7 y=179.3 size=51   weight=500 tracking=5.33 (centred)
//   CONSULTING: x=150.8 y=206.2 size=16.1 weight=400 tracking=9.67 (centred)
// x anchors are offset right of 146 centre because letter-spacing adds a trailing
// advance that drifts centred text left; offset = half the tracking value.
export function VerticalLockupSVG({
  width = 292,
  variant = "gradient",
}: {
  width?: number;
  variant?: LogoVariant;
}) {
  const id = `vl-${variant}-${width}`;
  const { nFill, hair, wordmark, sub, isGradient } = resolveColors(variant, id);
  const showLightBg = variant === "on-light" || variant === "dark";

  return (
    <svg
      width={width}
      height={Math.round(226 * (width / 292))}
      viewBox="0 0 292 226"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NEXYRA Consulting vertical lockup"
    >
      <defs>
        {isGradient && <GradientDef id={id} />}
        <clipPath id={`ct-${id}`}>
          <polygon points={CLIP_TOP_PTS} />
        </clipPath>
        <clipPath id={`cb-${id}`}>
          <polygon points={CLIP_BOT_PTS} />
        </clipPath>
      </defs>
      {showLightBg && <rect width="292" height="226" fill="white" rx="6" />}
      <g transform="translate(102.2,20) scale(0.73)">
        <g clipPath={`url(#ct-${id})`}>
          <path fill={nFill} d={N_PATH} />
        </g>
        <g clipPath={`url(#cb-${id})`}>
          <path fill={nFill} d={N_PATH} />
        </g>
        <line stroke={hair} strokeWidth="4" strokeLinecap="round" x1="-30" y1="115" x2="-2" y2="101" />
        <line stroke={hair} strokeWidth="4" strokeLinecap="round" x1="122" y1="41" x2="150" y2="27" />
      </g>
      <text x="148.7" y="179.3" textAnchor="middle" fontFamily={FONT} fontSize="51" fontWeight="500" letterSpacing="5.33" fill={wordmark}>
        NEXYRA
      </text>
      <text x="150.8" y="206.2" textAnchor="middle" fontFamily={FONT} fontSize="16.1" fontWeight="400" letterSpacing="9.67" fill={sub}>
        CONSULTING
      </text>
    </svg>
  );
}

// Backward-compat alias — stacked layout was renamed to vertical in v2.
export const StackedLockupSVG = VerticalLockupSVG;

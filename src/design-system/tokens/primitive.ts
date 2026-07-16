/**
 * AETHER — Primitive Tokens
 *
 * Raw values. NEVER reference these directly in components.
 * Always go through the semantic layer (./semantic).
 */

/* ─── Raw color palette ─────────────────────────────────────────────────── */

export const primitiveColor = {
  ink: {
    950: "#070708",
    900: "#0B0B0E",
    875: "#0E0E12",
    850: "#111114",
    800: "#18181C",
    750: "#1F1F24",
    700: "#25252B",
    600: "#2A2A30",
    500: "#3A3A42",
    400: "#5A5A64",
    300: "#7A7A86",
    200: "#A6A6B0",
    100: "#C9C9CE",
    50: "#E5E5E8",
    0: "#F5F2EC",
  },

  chroma: {
    500: "#E8FF6B",
    400: "#F0FF8A",
    300: "#F4FFA8",
    200: "#F8FFC4",
    100: "#FBFFE0",
  },

  iris: {
    600: "#8470E0",
    500: "#A48BFF",
    400: "#BBA8FF",
    300: "#CFC4FF",
    200: "#E1DBFF",
  },

  ember: {
    500: "#FF7A45",
    400: "#FF9266",
  },

  signal: {
    ok: "#7AE0A2",
    warn: "#E8B86B",
    err: "#FF6E7A",
    info: "#9BC5FF",
  },
} as const;

/* ─── Opacity scale ─────────────────────────────────────────────────────── */

export const primitiveOpacity = {
  0: "0",
  5: "0.05",
  10: "0.1",
  15: "0.15",
  20: "0.2",
  25: "0.25",
  30: "0.3",
  40: "0.4",
  50: "0.5",
  60: "0.6",
  70: "0.7",
  80: "0.8",
  90: "0.9",
  100: "1",
} as const;

/* ─── Spacing scale (8pt base, 4pt micro) ───────────────────────────────── */

export const primitiveSpace = {
  0: "0",
  px: "1px",
  0_5: "2px",
  1: "4px",
  1_5: "6px",
  2: "8px",
  2_5: "10px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
  40: "160px",
  48: "192px",
  64: "256px",
} as const;

/* ─── Radius ───────────────────────────────────────────────────────────── */

export const primitiveRadius = {
  none: "0",
  xs: "4px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  card: "18px",
  xl: "24px",
  "2xl": "32px",
  pill: "999px",
  full: "9999px",
} as const;

/* ─── Typography scale (rem) ────────────────────────────────────────────── */

export const primitiveFontSize = {
  "2xs": "0.6875rem", // 11px
  xs: "0.75rem",     // 12px
  sm: "0.8125rem",   // 13px
  base: "0.875rem",  // 14px
  md: "1rem",        // 16px
  lg: "1.125rem",    // 18px
  xl: "1.375rem",    // 22px
  "2xl": "1.875rem", // 30px
  "3xl": "2.5rem",   // 40px
  "4xl": "3.5rem",   // 56px
  "5xl": "4.5rem",   // 72px
} as const;

export const primitiveLineHeight = {
  none: "1",
  tight: "1.1",
  snug: "1.25",
  normal: "1.45",
  relaxed: "1.6",
  loose: "1.8",
} as const;

export const primitiveLetterSpacing = {
  tightest: "-0.02em",
  display: "-0.04em",
  tight: "-0.01em",
  normal: "0",
  wide: "0.02em",
  wider: "0.04em",
  widest: "0.12em",
} as const;

/* ─── Breakpoints ──────────────────────────────────────────────────────── */

export const primitiveBreakpoint = {
  xs: "420px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/* ─── Container widths ─────────────────────────────────────────────────── */

export const primitiveContainer = {
  prose: "640px",
  chat: "720px",
  panel: "880px",
  stage: "1180px",
  shell: "1440px",
} as const;

/* ─── Z-Index scale ────────────────────────────────────────────────────── */

export const primitiveZ = {
  recess: "-1",
  base: "0",
  raised: "10",
  sticky: "20",
  rail: "30",
  dock: "40",
  inspector: "50",
  overlay: "60",
  global: "70",
  modal: "80",
  command: "90",
  ambient: "-50",
} as const;

/* ─── Icon sizes ───────────────────────────────────────────────────────── */

export const primitiveIconSize = {
  xs: "12px",
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
  "4xl": "40px",
} as const;

/* ─── Button sizes ─────────────────────────────────────────────────────── */

export const primitiveSizeControl = {
  control: {
    sm: { h: "28px", px: "10px", text: "0.75rem" },
    md: { h: "34px", px: "14px", text: "0.8125rem" },
    lg: { h: "42px", px: "18px", text: "0.875rem" },
  },
} as const;

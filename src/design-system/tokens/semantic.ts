/**
 * AETHER — Semantic Tokens
 *
 * Components MUST consume these, never primitive tokens.
 * Themes (./themes/*) only override the *value* of these names.
 */

import { primitiveColor, primitiveOpacity } from "./primitive";

/* ─── Surface colors (panel + canvas) ──────────────────────────────────── */

export const semanticSurface = {
  canvas:        "var(--aether-surface-canvas)",
  recessed:      "var(--aether-surface-recessed)",
  panel:         "var(--aether-surface-panel)",
  panelRaised:   "var(--aether-surface-panel-raised)",
  panelFloating: "var(--aether-surface-panel-floating)",
  panelInset:    "var(--aether-surface-inset)",
  transparent:   "transparent",
} as const;

export const semanticBorder = {
  subtle:  "var(--aether-border-subtle)",
  default: "var(--aether-border-default)",
  strong:  "var(--aether-border-strong)",
  accent:  "var(--aether-border-accent)",
  iris:    "var(--aether-border-iris)",
} as const;

/* ─── Text ────────────────────────────────────────────────────────────── */

export const semanticText = {
  primary:    "var(--aether-text-primary)",
  secondary:  "var(--aether-text-secondary)",
  tertiary:   "var(--aether-text-tertiary)",
  muted:      "var(--aether-text-muted)",
  disabled:   "var(--aether-text-disabled)",
  onAccent:   "var(--aether-text-on-accent)",
  onIris:     "var(--aether-text-on-iris)",
  accent:     "var(--aether-text-accent)",
  iris:       "var(--aether-text-iris)",
} as const;

/* ─── Background gradient stops ───────────────────────────────────────── */

export const semanticBackground = {
  canvasGradient:    "var(--aether-bg-canvas-gradient)",
  panelGradient:     "var(--aether-bg-panel-gradient)",
  elevatedGradient:  "var(--aether-bg-elevated-gradient)",
  glassGradient:     "var(--aether-bg-glass-gradient)",
  orbCore:           "var(--aether-bg-orb-core)",
  orbHalo:           "var(--aether-bg-orb-halo)",
  trace:             "var(--aether-bg-trace)",
  hairline:          "var(--aether-bg-hairline)",
} as const;

/* ─── Glass surfaces (composed RGBA strings) ──────────────────────────── */

export const semanticGlass = {
  soft:    "var(--aether-glass-soft)",
  default: "var(--aether-glass-default)",
  strong:  "var(--aether-glass-strong)",
  frost:   "var(--aether-glass-frost)",
} as const;

/* ─── Glow (color-quantum legacy ──────────────────────────────────────── */

export const semanticGlow = {
  accent: "var(--aether-glow-accent)",
  iris:   "var(--aether-glow-iris)",
  ember:  "var(--aether-glow-ember)",
  signalOk:   "var(--aether-glow-signal-ok)",
  signalWarn: "var(--aether-glow-signal-warn)",
  signalErr:  "var(--aether-glow-signal-err)",
} as const;

/* ─── Shadow / Lighting ───────────────────────────────────────────────── */

export const semanticShadow = {
  anti:         "var(--aether-shadow-anti)",        // resting 6px
  active:       "var(--aether-shadow-active)",      // 12px on commit
  modal:        "var(--aether-shadow-modal)",       // elevations
  rail:         "var(--aether-shadow-rail)",
  inspector:    "var(--aether-shadow-inspector)",
  orb:          "var(--aether-shadow-orb)",
} as const;

/* ─── Focus / interaction ─────────────────────────────────────────────── */

export const semanticFocus = {
  ring:        "var(--aether-focus-ring)",
  ringOffset:  "var(--aether-focus-ring-offset)",
  hover:       "var(--aether-hover-tint)",
  activeTint:  "var(--aether-active-tint)",
} as const;

/* ─── Spacing (mapped to primitive) ───────────────────────────────────── */

export const semanticSpace = {
  "3xs": "2px",
  "2xs": "4px",
  xs:   "8px",
  sm:   "12px",
  md:   "16px",
  lg:   "24px",
  xl:   "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "96px",
  "5xl": "128px",
} as const;

/* ─── Radius ─────────────────────────────────────────────────────────── */

export const semanticRadius = {
  none:  "0",
  pill:  "999px",
  input: "10px",
  card:  "18px",
  panel: "24px",
  sheet: "32px",
  full: "9999px",
} as const;

/* ─── Typography size tokens (italic-free, opinionated) ───────────────── */

export const semanticType = {
  display:        { size: "var(--aether-type-display-size)",     line: "1.05", letter: "-0.04em", weight: "500" },
  "display-sm":   { size: "var(--aether-type-display-sm-size)",  line: "1.1",  letter: "-0.03em", weight: "500" },
  heading:        { size: "var(--aether-type-heading-size)",     line: "1.15", letter: "-0.02em", weight: "500" },
  title:          { size: "var(--aether-type-title-size)",       line: "1.25", letter: "-0.01em", weight: "500" },
  subtitle:       { size: "var(--aether-type-subtitle-size)",    line: "1.4",  letter: "0",       weight: "500" },
  body:           { size: "var(--aether-type-body-size)",        line: "1.55", letter: "0",       weight: "400" },
  bodyLg:         { size: "var(--aether-type-body-lg-size)",     line: "1.6",  letter: "0",       weight: "400" },
  caption:        { size: "var(--aether-type-caption-size)",     line: "1.4",  letter: "0.01em",  weight: "400" },
  label:          { size: "var(--aether-type-label-size)",       line: "1",    letter: "0.04em",  weight: "500" },
  overline:       { size: "var(--aether-type-overline-size)",    line: "1",    letter: "0.12em",  weight: "500" },
  code:           { size: "var(--aether-type-code-size)",        line: "1.55", letter: "-0.005em",weight: "400" },
  metric:         { size: "var(--aether-type-metric-size)",      line: "1",    letter: "-0.03em", weight: "500" },
  metricLg:       { size: "var(--aether-type-metric-lg-size)",   line: "1",    letter: "-0.04em", weight: "500" },
} as const;

/* ─── Blur ────────────────────────────────────────────────────────────── */

export const semanticBlur = {
  xs: "4px",
  sm: "8px",
  md: "14px",
  lg: "20px",
  xl: "32px",
  "2xl": "48px",
  panel: "blur(20px) saturate(160%)",
  orb:   "blur(80px)",
} as const;

/* ─── Opacity ladder ──────────────────────────────────────────────────── */

export const semanticOpacity = {
  hidden:    "0",
  subtle:    "0.6",
  ambient:   "0.5",
  ghost:     "0.25",
  settled:   "0.8",
  full:      "1",
} as const;

/* ─── Z-Index ─────────────────────────────────────────────────────────── */

export const semanticZ = {
  recess:    -1,
  base:      0,
  raised:    10,
  sticky:    20,
  rail:      30,
  dock:      40,
  inspector: 50,
  overlay:   60,
  global:    70,
  modal:     80,
  command:   90,
} as const;

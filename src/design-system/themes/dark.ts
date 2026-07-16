/**
 * AETHER — Dark Theme
 *
 * Binds semantic tokens to dark values via CSS variables.
 * Default theme (`:root`). Switch off via `<html data-theme="light" />`.
 */

export const darkThemeCss = `
:root,
[data-theme="dark"] {
  /* ─── Surface ─────────────────────────────────────────────────── */
  --aether-surface-canvas:        #070708;
  --aether-surface-recessed:      #0B0B0E;
  --aether-surface-panel:         #0E0E12;
  --aether-surface-panel-raised:  #111114;
  --aether-surface-panel-floating:#18181C;
  --aether-surface-inset:         #0B0B0E;

  /* ─── Border ──────────────────────────────────────────────────── */
  --aether-border-subtle:  rgba(255, 255, 255, 0.04);
  --aether-border-default: rgba(255, 255, 255, 0.07);
  --aether-border-strong:  rgba(255, 255, 255, 0.12);
  --aether-border-accent:  rgba(232, 255, 107, 0.35);
  --aether-border-iris:    rgba(164, 139, 255, 0.32);

  /* ─── Text ────────────────────────────────────────────────────── */
  --aether-text-primary:    #F5F2EC;
  --aether-text-secondary:  #C9C9CE;
  --aether-text-tertiary:   #8A8A93;
  --aether-text-muted:      #5A5A64;
  --aether-text-disabled:   #3A3A42;
  --aether-text-on-accent:  #0B0B0E;
  --aether-text-on-iris:    #0B0B0E;
  --aether-text-accent:     #E8FF6B;
  --aether-text-iris:       #BBA8FF;

  /* ─── Background gradients ────────────────────────────────────── */
  --aether-bg-canvas-gradient:    radial-gradient(120% 90% at 50% 0%, #0E0E12 0%, #070708 70%);
  --aether-bg-panel-gradient:     linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  --aether-bg-elevated-gradient:  linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  --aether-bg-glass-gradient:     linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  --aether-bg-orb-core:           radial-gradient(circle at 50% 50%, #A48BFF 0%, #8470E0 50%, transparent 75%);
  --aether-bg-orb-halo:           radial-gradient(circle at 50% 50%, rgba(232,255,107,0.10) 0%, transparent 70%);
  --aether-bg-trace:              linear-gradient(180deg, #E8FF6B 0%, #A48BFF 100%);
  --aether-bg-hairline:           linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);

  /* ─── Glass ───────────────────────────────────────────────────── */
  --aether-glass-soft:    rgba(20, 20, 24, 0.55);
  --aether-glass-default: rgba(14, 14, 18, 0.72);
  --aether-glass-strong:  rgba(11, 11, 14, 0.88);
  --aether-glass-frost:   rgba(24, 24, 28, 0.70);

  /* ─── Glow ────────────────────────────────────────────────────── */
  --aether-glow-accent: 0 0 24px -6px rgba(232,255,107,0.45), 0 0 8px -2px rgba(232,255,107,0.30);
  --aether-glow-iris:   0 0 24px -6px rgba(164,139,255,0.45), 0 0 8px -2px rgba(164,139,255,0.30);
  --aether-glow-ember:  0 0 24px -6px rgba(255,122,69,0.40), 0 0 8px -2px rgba(255,122,69,0.25);
  --aether-glow-signal-ok:   0 0 24px -6px rgba(122,224,162,0.40);
  --aether-glow-signal-warn: 0 0 24px -6px rgba(232,184,107,0.40);
  --aether-glow-signal-err:  0 0 24px -6px rgba(255,110,122,0.40);

  /* ─── Shadow ──────────────────────────────────────────────────── */
  --aether-shadow-anti:      6px 0 0 -2px rgba(0,0,0,0.18);
  --aether-shadow-active:    0 12px 28px -10px rgba(0,0,0,0.55), 0 4px 10px -2px rgba(0,0,0,0.30);
  --aether-shadow-modal:     0 32px 64px -16px rgba(0,0,0,0.70), 0 12px 28px -10px rgba(0,0,0,0.45);
  --aether-shadow-rail:      1px 0 0 0 var(--aether-border-subtle);
  --aether-shadow-inspector: -1px 0 0 0 var(--aether-border-subtle);
  --aether-shadow-orb:       0 0 80px 0 rgba(164,139,255,0.25), 0 0 160px 0 rgba(164,139,255,0.18);

  /* ─── Focus ──────────────────────────────────────────────────── */
  --aether-focus-ring:        #E8FF6B;
  --aether-focus-ring-offset: #0B0B0E;
  --aether-hover-tint:        rgba(232, 255, 107, 0.06);
  --aether-active-tint:       rgba(232, 255, 107, 0.10);

  /* ─── Type sizes (consumed by theme regardless of scheme) ─────── */
  --aether-type-display-size:      clamp(2.5rem, 5vw, 4.5rem);
  --aether-type-display-sm-size:   clamp(1.875rem, 3vw, 2.5rem);
  --aether-type-heading-size:      1.375rem;
  --aether-type-title-size:        1.125rem;
  --aether-type-subtitle-size:     1rem;
  --aether-type-body-size:         0.875rem;
  --aether-type-body-lg-size:      1rem;
  --aether-type-caption-size:      0.75rem;
  --aether-type-label-size:        0.6875rem;
  --aether-type-overline-size:     0.625rem;
  --aether-type-code-size:         0.8125rem;
  --aether-type-metric-size:       1.375rem;
  --aether-type-metric-lg-size:    clamp(2rem, 4vw, 3rem);
}
`;

/**
 * AETHER — Light Theme
 *
 * Binds the same semantic tokens to light values.
 * Switching theme only swaps the CSS variable values.
 * No component recompiles; no duplication.
 */

export const lightThemeCss = `
[data-theme="light"] {
  /* ─── Surface ─────────────────────────────────────────────────── */
  --aether-surface-canvas:        #F5F2EC;
  --aether-surface-recessed:      #ECEAE3;
  --aether-surface-panel:         rgba(255, 255, 255, 0.72);
  --aether-surface-panel-raised:  rgba(255, 255, 255, 0.85);
  --aether-surface-panel-floating:rgba(255, 255, 255, 0.95);
  --aether-surface-inset:         #EFEDE5;

  /* ─── Border ──────────────────────────────────────────────────── */
  --aether-border-subtle:  rgba(11, 11, 14, 0.05);
  --aether-border-default: rgba(11, 11, 14, 0.08);
  --aether-border-strong:  rgba(11, 11, 14, 0.14);
  --aether-border-accent:  rgba(180, 200, 70, 0.55);
  --aether-border-iris:    rgba(120, 100, 220, 0.45);

  /* ─── Text ────────────────────────────────────────────────────── */
  --aether-text-primary:    #0B0B0E;
  --aether-text-secondary:  #3A3A42;
  --aether-text-tertiary:   #5A5A64;
  --aether-text-muted:      #7A7A86;
  --aether-text-disabled:   #A6A6B0;
  --aether-text-on-accent:  #0B0B0E;
  --aether-text-on-iris:    #FFFFFF;
  --aether-text-accent:     #C0D63F;
  --aether-text-iris:       #6E5BD8;

  /* ─── Background gradients ────────────────────────────────────── */
  --aether-bg-canvas-gradient:    radial-gradient(120% 90% at 50% 0%, #F5F2EC 0%, #ECEAE3 70%);
  --aether-bg-panel-gradient:     linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.50) 100%);
  --aether-bg-elevated-gradient:  linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.70) 100%);
  --aether-bg-glass-gradient:     linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%);
  --aether-bg-orb-core:           radial-gradient(circle at 50% 50%, #A48BFF 0%, #6E5BD8 50%, transparent 75%);
  --aether-bg-orb-halo:           radial-gradient(circle at 50% 50%, rgba(180,200,70,0.18) 0%, transparent 70%);
  --aether-bg-trace:              linear-gradient(180deg, #C0D63F 0%, #6E5BD8 100%);
  --aether-bg-hairline:           linear-gradient(90deg, transparent, rgba(11,11,14,0.10), transparent);

  /* ─── Glass ───────────────────────────────────────────────────── */
  --aether-glass-soft:    rgba(245, 242, 236, 0.55);
  --aether-glass-default: rgba(255, 255, 255, 0.65);
  --aether-glass-strong:  rgba(255, 255, 255, 0.85);
  --aether-glass-frost:   rgba(255, 255, 255, 0.70);

  /* ─── Glow ────────────────────────────────────────────────────── */
  --aether-glow-accent:  0 0 24px -6px rgba(180, 200, 70, 0.45);
  --aether-glow-iris:    0 0 24px -6px rgba(120, 100, 220, 0.45);
  --aether-glow-ember:   0 0 24px -6px rgba(220, 100, 60, 0.40);
  --aether-glow-signal-ok:   0 0 24px -6px rgba(60, 160, 100, 0.40);
  --aether-glow-signal-warn: 0 0 24px -6px rgba(200, 150, 60, 0.40);
  --aether-glow-signal-err:  0 0 24px -6px rgba(220, 60, 80, 0.40);

  /* ─── Shadow ──────────────────────────────────────────────────── */
  --aether-shadow-anti:      6px 0 0 -2px rgba(11,11,14,0.06);
  --aether-shadow-active:    0 12px 28px -10px rgba(11,11,14,0.18), 0 4px 10px -2px rgba(11,11,14,0.10);
  --aether-shadow-modal:     0 32px 64px -16px rgba(11,11,14,0.25), 0 12px 28px -10px rgba(11,11,14,0.16);
  --aether-shadow-rail:      1px 0 0 0 var(--aether-border-subtle);
  --aether-shadow-inspector: -1px 0 0 0 var(--aether-border-subtle);
  --aether-shadow-orb:       0 0 80px 0 rgba(120,100,220,0.22), 0 0 160px 0 rgba(120,100,220,0.12);

  /* ─── Focus ──────────────────────────────────────────────────── */
  --aether-focus-ring:        #C0D63F;
  --aether-focus-ring-offset: #FFFFFF;
  --aether-hover-tint:        rgba(180, 200, 70, 0.08);
  --aether-active-tint:       rgba(180, 200, 70, 0.14);

  /* Type sizes kept identical to dark — only color values diverge */
}
`;

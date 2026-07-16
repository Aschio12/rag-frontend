# AETHER Design System

The reusable foundation that every AETHER screen will use.

## Structure

```
src/design-system/
├── tokens/         # semantic + primitive design tokens
├── themes/         # dark + light themes mapped to the same semantic tokens
├── motion/         # motion grammar (durations, easings, springs, hooks)
├── primitives/     # reusable building blocks
│   ├── layout/     # Stack, Inline, Grid, Section, Container, Bleed
│   ├── surface/    # Panel, Glass, Surface, Glow, Divider
│   ├── animation/  # FadeIn, ScaleIn, SlideIn, PageTransition, AnimatedContainer
│   ├── control/    # Button, IconButton, Input, SearchInput
│   ├── feedback/   # Badge, Tag, StatusIndicator
│   └── state/      # Card, EmptyState, LoadingState
├── typography/     # Display, Heading, Title, Subtitle, Body, Caption, Label, Code, Metric, Overline
├── icons/          # AetherIcon wrapper + glyph registry
├── effects/        # Glow, Spotlight, GradientBorder, Noise, MeshGradient, Aurora, ParticleLayer, AmbientLight, ShadowLayer
├── background/     # Background Engine (animated gradient, aurora, noise, particle, lighting, blur, mouse-reactive)
├── utils/          # aetherCx, useReducedMotion, etc.
└── docs/           # per-primitive documentation
```

## Principles

- One semantic token maps to one visual decision. Never hex literals in components.
- Dark and light themes share the same semantic token names.
- Motion is communication, not decoration.
- One accent color, never two, per view.
- Every interactive object has affordance, response, commit, and continuity.

# Aether — Living AI Core

The visual system that makes Aether feel like an intelligent environment.

## Files

| File | Purpose |
|---|---|
| `state-machine.ts` | Pure 5-state machine (idle / user_typing / thinking / streaming / settling). Returns a `CoreVital` vector. |
| `AetherCore.tsx` | R3F Canvas root. Composes children and wires `PerformanceMonitor`. |
| `CoreMesh.tsx` | Inner icosphere with the chromatic shader. |
| `CoreMaterial.tsx` | Custom ShaderMaterial (fresnel + radial gradient + chroma pulse). |
| `CoreHalo.tsx` | Larger luminous shell, scales with `vital.halo`. |
| `CoreRings.tsx` | Three independently-rotating translucent rings. |
| `CoreSignals.tsx` | Concentric energy waves emerging outward — driven by `vital.signals`. |
| `CoreParticles.tsx` | Instanced motes in sparse orbits. |
| `CoreCamera.tsx` | Camera breathing — subtle, scripted, deterministic. |
| `StreamingController.ts` | Measures token rate, patches the core's pulse smoothly. |
| `useCoreState.ts` | `CoreBus` + `useCoreState / useCoreEmitter / useCoreVitalPatch`. |
| `CoreController.tsx` | The mount element. Client-only. CSS fallback orb while R3F hydrates. |

## How the core reacts

| Event | State transition | Visible behaviour |
|---|---|---|
| user typing in dock | idle → user_typing | halo +8%, rotation +200% |
| handleSend → agentic | user_typing → thinking | 3 signals, beams emerge, halo +20% |
| stream begin | thinking → streaming | 5 signals, peak chroma, halo +40% |
| stream end | streaming → settling → idle | relax to base over 2s |

## State broadcasts

Components outside the Core (page-level interactions) call `useCoreEmitter()` and emit any of:

```
TYPING_START | TYPING_STOP | THINKING_START | THINKING_END |
STREAM_START | STREAM_END   | TICK
```

## Performance

- Damped by `PerformanceMonitor` (`high` ↔ `low`).
- Honors `prefers-reduced-motion` (drops to opacity + slow blend).
- Particles collapse to 8 on `compact` mode.
- Geometry detail drops by ~50% in low-power mode.

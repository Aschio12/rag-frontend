"use client";

/**
 * CoreController — the React element that mounts AetherCore inside the DOM.
 *
 *  - Reads reduced-motion preference and device capability.
 *  - Dynamically imports AetherCore only on the client (no SSR for WebGL).
 *  - Subscribes to the CoreBus for live vital updates.
 *  - Renders nothing if `active=false` (page hidden).
 *
 * This component is intentionally the only "smart" piece; everything else is
 * pure visual elements that receive `vital` via props.
 */

import * as React from "react";
import { useAetherMotion } from "@/design-system/motion";
import { useCoreState } from "./useCoreState";
import type { CoreState } from "./state-machine";

interface CoreControllerProps {
  /** When false, the canvas is unmounted entirely. */
  active?: boolean;
  /** Optional aria-label override. */
  label?: string;
}

export const CoreController = React.memo(function CoreController({
  active = true,
  label = "Aether — living intelligence",
}: CoreControllerProps) {
  const { vital } = useCoreState();
  const { reduced } = useAetherMotion();
  const [Core, setCore] = React.useState<null | React.ComponentType<{
    vital: typeof vital;
    reducedMotion: boolean;
    active: boolean;
  }>>(null);

  React.useEffect(() => {
    if (!active) return;
    let mounted = true;
    import("./AetherCore").then((m) => {
      if (mounted) setCore(() => m.AetherCore);
    });
    return () => {
      mounted = false;
    };
  }, [active]);

  return (
    <div
      role="img"
      aria-label={label}
      data-core-state={vital && (vital as unknown as { state?: CoreState }).state}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {Core ? (
        <Core vital={vital} reducedMotion={reduced} active={active} />
      ) : (
        <CssShadowOrb vital={vital} />
      )}
    </div>
  );
});

/**
 * CSS fallback orb shown until R3F is loaded. Uses the same vital signal.
 * Zero-cost, no WebGL.
 */
const CssShadowOrb = React.memo(function CssShadowOrb({
  vital,
}: {
  vital: { alive: number; halo: number; chroma: number; pulse: number };
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    node.style.setProperty("--pulse", String(vital.pulse));
    node.style.setProperty("--alive", String(vital.alive));
    node.style.setProperty("--halo", String(vital.halo));
    node.style.setProperty("--chroma", String(vital.chroma));
  }, [vital]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "calc(160px * var(--halo, 1))",
        height: "calc(160px * var(--halo, 1))",
        borderRadius: 999,
        background:
          "radial-gradient(circle, rgba(232,255,107, calc(0.06 + var(--chroma,0) * 0.18)) 0%, rgba(164,139,255, calc(0.10 + var(--chroma,0) * 0.20)) 50%, transparent 75%)",
        filter: "blur(40px)",
        opacity: "calc(0.5 + var(--alive, 0.4) * 0.45)",
      }}
    />
  );
});

"use client";

/**
 * AetherCore — root 3D scene for the Living AI Core.
 *
 * Mounts rings, halo, particles, signals into a single Canvas with WebGL
 * preserving drawing buffer for clean compositing under the workspace.
 */

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { CoreVital } from "./state-machine";
import { CoreHalo } from "./CoreHalo";
import { CoreMesh } from "./CoreMesh";
import { CoreRings } from "./CoreRings";
import { CoreSignals } from "./CoreSignals";
import { CoreParticles } from "./CoreParticles";
import { CoreCamera } from "./CoreCamera";

interface AetherCoreProps {
  vital: CoreVital;
  reducedMotion: boolean;
  /** When false, halts rendering entirely. */
  active: boolean;
}

export const AetherCore = React.memo(function AetherCore({
  vital,
  reducedMotion,
  active,
}: AetherCoreProps) {
  const [quality, setQuality] = React.useState<"high" | "mid" | "low">("high");
  const lowPower = quality !== "high" || reducedMotion;

  return (
    <Canvas
      camera={{ position: [0, 0, 38], fov: 35 }}
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: "low-power" }}
      frameloop={active ? "always" : "demand"}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "transparent",
        contain: "strict",
      }}
    >
      <PerformanceMonitor
        onDecline={() => setQuality("low")}
        onIncline={() => setQuality("high")}
        flipflops={3}
        step={0.6}
      />
      <CoreCamera breathe={vital.breathe} />
      <ambientLight intensity={0.18} />
      <pointLight
        position={[0, 2, 8]}
        intensity={1.2}
        color="#BBA8FF"
        distance={32}
        decay={2}
      />
      <CoreMesh vital={vital} lowPower={lowPower} />
      <CoreHalo vital={vital} lowPower={lowPower} />
      <CoreRings vital={vital} lowPower={lowPower} />
      <CoreSignals vital={vital} lowPower={lowPower} />
      <CoreParticles vital={vital} lowPower={lowPower} compact={quality === "low"} />
    </Canvas>
  );
});

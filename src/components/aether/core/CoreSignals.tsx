"use client";

/**
 * CoreSignals — outbound energy waves + scan lines that emerge from the core
 * during THINKING and STREAMING states. Translates "intelligence" into motion.
 *
 * Concentric ring "waves" travel outward and reset. Created cheaply with a
 * single shader-driven disc geometry; one wave per `vital.signals` slot.
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CoreVital } from "./state-machine";

interface CoreSignalsProps {
  vital: CoreVital;
  lowPower: boolean;
}

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uRadius;
  uniform float uOpacity;
  uniform vec3  uColor;
  void main() {
    float d = length(vUv - 0.5) * 2.0;       // 0..1
    float ring = smoothstep(uRadius - 0.05, uRadius, d) *
                 (1.0 - smoothstep(uRadius, uRadius + 0.18, d));
    gl_FragColor = vec4(uColor, ring * uOpacity);
  }
`;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const CoreSignals = React.memo(function CoreSignals({ vital, lowPower }: CoreSignalsProps) {
  const count = lowPower ? 2 : 5;
  const slots = Math.min(count, Math.max(0, vital.signals | 0));
  const refs = React.useRef<(THREE.Mesh | null)[]>([]);
  const phaseRef = React.useRef<number[]>(Array.from({ length: count }, (_, i) => i / count));

  useFrame((_, dt) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const factor = lowPower ? 0.55 : 1;
      phaseRef.current[i] = (phaseRef.current[i] + dt * 0.18 * factor) % 1;
      const radius = 0.15 + phaseRef.current[i] * 0.85;
      const opacity =
        i < slots
          ? (1 - phaseRef.current[i]) * (0.35 + vital.alive * 0.45)
          : 0;
      // @ts-expect-error custom uniform
      mesh.material.uniforms.uRadius.value = radius;
      // @ts-expect-error custom uniform
      mesh.material.uniforms.uOpacity.value = opacity;
    });
  });

  // Pre-build 5 materials, only slots actually render their uniforms.
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0, -0.6]}
          ref={(el) => (refs.current[i] = el)}
        >
          <planeGeometry args={[42, 42]} />
          <shaderMaterial
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            uniforms={{
              uRadius: { value: 0.2 },
              uOpacity: { value: 0 },
              uColor: { value: new THREE.Color(i % 2 === 0 ? "#A48BFF" : "#7AE0A2") },
            }}
            vertexShader={VERT}
            fragmentShader={FRAG}
          />
        </mesh>
      ))}
    </group>
  );
});

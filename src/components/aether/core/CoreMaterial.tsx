"use client";

/**
 * AetherCoreMaterial — shader-friendly layered gradient material.
 *
 * Renders a soft fresnel + chromatic gradient suitable for the orb. Uses
 * transparency, additive blending, and <60 polygons so it stays GPU-cheap.
 *
 * Color stops bind to the existing semantic tokens (chroma, iris).
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AetherCoreMaterialProps {
  /** 0..1 — drives core glow intensity. */
  alive: number;
  /** 0..1 — momentary energy bumps. */
  pulse: number;
  /** Reduces geometry and effects when true. */
  lowPower: boolean;
}

const VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mvPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform float uAlive;
  uniform float uPulse;
  uniform float uTime;
  uniform vec3 uChroma;
  uniform vec3 uIris;
  uniform vec3 uBase;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 viewDir = normalize(-vViewPos);
    float fres = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.2);

    float warmth = clamp(uAlive, 0.0, 1.0);
    float pulse = clamp(uPulse, 0.0, 1.0);

    vec3 deep = mix(uBase, uIris, 0.35 + 0.4 * sin(uTime * 0.7));
    vec3 hot  = mix(uChroma, uIris, 0.4);

    vec3 col = mix(deep, hot, fres);
    col += hot * (warmth * 0.18);
    col += uChroma * pulse * 0.4;

    // inner radial gradient
    float r = length(vViewPos) / 36.0;
    col *= smoothstep(1.2, 0.0, r) * 1.05;

    gl_FragColor = vec4(col, fres * (0.4 + warmth * 0.55));
  }
`;

export const AetherCoreMaterial = React.memo(function AetherCoreMaterial({
  alive,
  pulse,
  lowPower,
}: AetherCoreMaterialProps) {
  const matRef = React.useRef<THREE.ShaderMaterial>(null);
  const uniforms = React.useMemo(
    () => ({
      uAlive: { value: alive },
      uPulse: { value: pulse },
      uTime:  { value: 0 },
      uChroma:{ value: new THREE.Color("#E8FF6B") },
      uIris:  { value: new THREE.Color("#A48BFF") },
      uBase:  { value: new THREE.Color("#0B0B0E") },
    }),
    [],
  );

  React.useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uAlive.value = alive;
    matRef.current.uniforms.uPulse.value = pulse;
  }, [alive, pulse]);

  useFrame((_, dt) => {
    if (!matRef.current) return;
    if (!lowPower) {
      matRef.current.uniforms.uTime.value += dt;
    } else {
      matRef.current.uniforms.uTime.value += dt * 0.4;
    }
  });

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={VERT}
      fragmentShader={FRAG}
      transparent
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      uniforms={uniforms}
    />
  );
});

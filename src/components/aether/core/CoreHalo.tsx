"use client";

/**
 * CoreHalo — soft luminous shell that breathes with the core.
 *
 * A larger icosahedron rendered with additive transparent material. Its
 * scale and opacity track `vital.halo` (1 → 1.6) and `vital.chroma`.
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CoreVital } from "./state-machine";

interface CoreHaloProps {
  vital: CoreVital;
  lowPower: boolean;
}

export const CoreHalo = React.memo(function CoreHalo({ vital, lowPower }: CoreHaloProps) {
  const ref = React.useRef<THREE.Mesh>(null);
  const target = React.useRef(1);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const factor = lowPower ? 0.7 : 1;
    target.current = 1 + (vital.halo - 1) * 0.35;
    ref.current.scale.lerp(
      { x: target.current, y: target.current, z: target.current } as unknown as THREE.Vector3,
      0.06 * factor,
    );
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    if (mat) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.06 + vital.chroma * 0.18, 0.04);
    }
  });

  return (
    <mesh ref={ref} renderOrder={-1}>
      <icosahedronGeometry args={[8, 1]} />
      <meshBasicMaterial
        transparent
        opacity={0.06}
        color={new THREE.Color("#A48BFF")}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
});

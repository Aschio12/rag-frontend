"use client";

/**
 * CoreRings — three translucent rings that orbit independently.
 *
 * Each ring rotates at its own speed and tilts differently, so the orb
 * never feels mechanical. Ring intensity (rotation speed + opacity) is
 * tied to `vital.alive` and `vital.signals`.
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CoreVital } from "./state-machine";

interface CoreRingsProps {
  vital: CoreVital;
  lowPower: boolean;
}

interface RingSpec {
  ax: THREE.Vector3;
  radius: number;
  baseSpeed: number;
  width: number;
  color: string;
}

const RINGS: RingSpec[] = [
  { ax: new THREE.Vector3(0, 1, 0), radius: 10, baseSpeed: 0.18, width: 0.06, color: "#E8FF6B" },
  { ax: new THREE.Vector3(1, 0.2, 0).normalize(), radius: 11.5, baseSpeed: -0.13, width: 0.04, color: "#A48BFF" },
  { ax: new THREE.Vector3(0, 0.6, 1).normalize(), radius: 13, baseSpeed: 0.09, width: 0.02, color: "#7AE0A2" },
];

export const CoreRings = React.memo(function CoreRings({ vital, lowPower }: CoreRingsProps) {
  const refs = React.useRef<(THREE.Mesh | null)[]>([null, null, null]);

  useFrame((_, dt) => {
    const factor = lowPower ? 0.55 : 1;
    const speed = 0.4 + vital.alive * 1.6;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const base = RINGS[i];
      m.rotateOnAxis(base.ax, dt * base.baseSpeed * speed * factor);
      const mat = m.material as THREE.MeshBasicMaterial;
      if (mat) {
        const targetOpacity = (0.18 + vital.alive * 0.22) * (vital.signals > 0 ? 1 : 0.33);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.06);
      }
    });
  });

  return (
    <group>
      {RINGS.map((r, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <torusGeometry args={[r.radius, r.width, 16, lowPower ? 48 : 96]} />
          <meshBasicMaterial
            transparent
            color={new THREE.Color(r.color)}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
});

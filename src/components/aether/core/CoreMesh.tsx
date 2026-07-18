"use client";

/**
 * CoreMesh — the inner orb itself.
 *
 * A low-poly icosphere with AetherCoreMaterial applied. Pulses on `vital.alive`,
 * rotates at `vital.rotation`. Independent from rings/halo so it can be tuned
 * without breaking the others.
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { AetherCoreMaterial } from "./CoreMaterial";
import type { CoreVital } from "./state-machine";

interface CoreMeshProps {
  vital: CoreVital;
  lowPower: boolean;
}

export const CoreMesh = React.memo(function CoreMesh({ vital, lowPower }: CoreMeshProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    const factor = lowPower ? 0.6 : 1;
    meshRef.current.rotation.y += dt * vital.rotation * factor;
    meshRef.current.rotation.x += dt * vital.rotation * factor * 0.4;
    const targetScale = 1 + vital.pulse * 0.06 + (vital.alive - 0.36) * 0.08;
    meshRef.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale } as unknown as THREE.Vector3,
      0.04,
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[6, lowPower ? 4 : 6]} />
      <AetherCoreMaterial
        alive={vital.alive}
        pulse={vital.pulse}
        lowPower={lowPower}
      />
    </mesh>
  );
});

import * as THREE from "three";

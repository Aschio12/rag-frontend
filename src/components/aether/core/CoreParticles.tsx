"use client";

/**
 * CoreParticles — few, large-spaced motes drifting in spiral orbits.
 *
 * Uses a single InstancedMesh of small spheres for cheap GPU cost.
 * Each particle has its own angular velocity; orbits decay toward the orb
 * center, fade in/out softly.
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CoreVital } from "./state-machine";

interface CoreParticlesProps {
  vital: CoreVital;
  lowPower: boolean;
  compact?: boolean;
}

const COUNT_DEFAULT = 18;
const COUNT_COMPACT = 8;

interface Particle {
  radius: number;
  angle: number;
  y: number;
  speed: number;
  basePhase: number;
}

export const CoreParticles = React.memo(function CoreParticles({
  vital,
  lowPower,
  compact,
}: CoreParticlesProps) {
  const count = compact ? COUNT_COMPACT : COUNT_DEFAULT;
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const particles = React.useRef<Particle[]>([]);
  const tmp = React.useMemo(() => new THREE.Object3D(), []);

  if (particles.current.length === 0) {
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        radius: 12 + Math.random() * 6,
        angle: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 6,
        speed: 0.04 + Math.random() * 0.06,
        basePhase: Math.random(),
      });
    }
    particles.current = arr;
  }

  useFrame((_, dt) => {
    if (!ref.current) return;
    const factor = lowPower ? 0.5 : 1;
    const activity = 0.4 + vital.alive * 0.6;
    particles.current.forEach((p, i) => {
      p.angle += dt * p.speed * activity * factor * 0.6;
      const r = p.radius + Math.sin(p.angle * 0.5 + p.basePhase) * 0.4;
      const x = Math.cos(p.angle) * r;
      const z = Math.sin(p.angle) * r;
      const y = p.y + Math.sin(p.angle * 0.7 + p.basePhase) * 0.6;
      tmp.position.set(x, y, z);
      const s =
        (0.05 + 0.05 * Math.sin(p.angle * 1.3 + p.basePhase)) *
        (0.6 + vital.alive * 0.4);
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      ref.current!.setMatrixAt(i, tmp.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;

    const mat = ref.current.material as THREE.MeshBasicMaterial;
    if (mat) {
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        0.25 + vital.alive * 0.55,
        0.05,
      );
    }
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        transparent
        opacity={0.4}
        color={new THREE.Color("#E8FF6B")}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
});

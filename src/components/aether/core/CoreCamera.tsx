"use client";

/**
 * CoreCamera — breathes the camera slightly according to `breathe`.
 *
 * Subtle Y/z oscillation; never enough to break the composition. R3F
 * `OrbitControls` is intentionally NOT used — the camera is fully scripted
 * to keep the experience calm and deterministic.
 */

import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CoreCameraProps {
  breathe: number;
}

export const CoreCamera = React.memo(function CoreCamera({ breathe }: CoreCameraProps) {
  const camera = useThree((state) => state.camera);
  const target = React.useRef({ x: 0, y: 0, z: 38 });

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const x = Math.sin(t * 0.07) * 0.6 + breathe * 0.3;
    const y = Math.cos(t * 0.05) * 0.35 + breathe * 0.18;
    const z = 38 + Math.sin(t * 0.04) * 0.4;
    target.current.x += (x - target.current.x) * 0.02;
    target.current.y += (y - target.current.y) * 0.02;
    target.current.z += (z - target.current.z) * 0.02;
    camera.position.set(target.current.x, target.current.y, target.current.z);
    camera.lookAt(0, 0, 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      // FOV breathing
      camera.fov = 35 + Math.sin(t * 0.18) * 0.6;
      camera.updateProjectionMatrix();
    }
    void dt;
  });

  return null;
});

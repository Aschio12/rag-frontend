"use client";

/**
 * StreamingController — measures incoming stream rate and bumps the core
 * "pulse" vital in real time.
 *
 * Pages call `controller.start(text)` once streaming begins, call
 * `controller.tick(chunk)` per chunk, and `controller.stop()` when done.
 * Internally computes tokens/sec using an EWMA over the last 6 ticks.
 *
 * The exposed vital patch respects reduced motion by holding a low-energy
 * pulse even during streaming.
 */

import * as React from "react";
import { useCoreVitalPatch } from "./useCoreState";
import { useAetherMotion } from "@/design-system/motion";

interface StreamingControllerOptions {
  /** Number of tokens that constitute "strong stream"; default 30 t/s. */
  threshold?: number;
}

export function useStreamingController(opts: StreamingControllerOptions = {}) {
  const threshold = opts.threshold ?? 30;
  const patch = useCoreVitalPatch();
  const { reduced } = useAetherMotion();
  const tokensRef = React.useRef(0);
  const lastAtRef = React.useRef(0);
  const lastPulseAt = React.useRef(0);
  const ewmaRef = React.useRef(0);
  const startedRef = React.useRef(false);

  // idle pulse: periodic tiny pulse so the core feels alive without input
  React.useEffect(() => {
    if (startedRef.current) return;
    const id = window.setInterval(() => {
      if (startedRef.current) return;
      const now = performance.now();
      const gap = now - lastPulseAt.current;
      if (gap < 4500) return;
      lastPulseAt.current = now;
      patch({ pulse: reduced ? 0 : 0.05 + Math.random() * 0.04 });
    }, 1100);
    return () => window.clearInterval(id);
  }, [patch, reduced]);

  return {
    start() {
      startedRef.current = true;
      tokensRef.current = 0;
      lastAtRef.current = performance.now();
      ewmaRef.current = 0;
    },
    /** Estimate tokens delivered; pass length-delta or chunk string. */
    tick(delta: number | string) {
      if (!startedRef.current) return;
      const now = performance.now();
      const add = typeof delta === "string" ? delta.length : delta;
      tokensRef.current += add;
      const dt = Math.max(1, now - lastAtRef.current);
      const rate = (add / dt) * 1000; // chars / sec
      // EWMA smoothing
      ewmaRef.current = ewmaRef.current * 0.7 + rate * 0.3;
      const norm = Math.min(1, ewmaRef.current / threshold);
      patch({
        pulse: reduced ? 0.04 : 0.18 + norm * 0.4,
        alive: reduced ? 0.5 : 0.62 + norm * 0.32,
        chroma: reduced ? 0.3 : 0.5 + norm * 0.4,
        halo: 1 + norm * 0.4,
        signals: 3 + Math.floor(norm * 2),
      });
      lastAtRef.current = now;
    },
    stop() {
      startedRef.current = false;
      patch({ pulse: 0.05, alive: 0.36, chroma: 0, halo: 1, signals: 0 });
    },
  };
}

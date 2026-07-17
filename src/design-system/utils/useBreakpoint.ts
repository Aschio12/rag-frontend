"use client";

/**
 * useBreakpoint — small SSR-safe responsive hook.
 *
 * Returns one of: "sm" | "md" | "lg" | "xl" matching Tailwind v4 conventions:
 *   sm  ≤ 640px
 *   md  ≤ 768px
 *   lg  ≤ 1024px
 *   xl  > 1024px
 *
 * Defaults to "xl" before mount to keep SSR happy.
 */

import { useEffect, useState } from "react";

export type AetherBreakpoint = "sm" | "md" | "lg" | "xl";

export function useBreakpoint(): AetherBreakpoint {
  const [bp, setBp] = useState<AetherBreakpoint>("xl");

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w <= 640) return setBp("sm");
      if (w <= 768) return setBp("md");
      if (w <= 1024) return setBp("lg");
      return setBp("xl");
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  return bp;
}

"use client";

import dynamic from "next/dynamic";

export const AmbientCanvasClient = dynamic(
  () => import("@/design-system/effects/AmbientCanvas").then((m) => m.AmbientCanvas),
  { ssr: false },
);

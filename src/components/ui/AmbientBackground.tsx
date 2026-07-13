"use client";

import React from "react";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-50 w-full h-full bg-[#020204] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_90%)]" />
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#00f2fe] to-[#7000ff] opacity-[0.08] blur-[120px] animate-subtle-drift" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#7000ff] to-[#00ff87] opacity-[0.06] blur-[140px] [animation-delay:4s] animate-subtle-drift" />
      <div className="absolute inset-0 scanlines opacity-[0.02]" />
    </div>
  );
}

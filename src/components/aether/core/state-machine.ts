/**
 * AETHER — Core State Machine
 *
 * Five states, deterministic transitions. The orchestrators (StreamingController,
 * CoreController) call `transition()` with a finite event and the state machine
 * returns the next state plus a "vital" vector (0..1) describing aliveness.
 *
 * The state machine is XState-style: pure, easily testable, no React imports.
 */

export type CoreState = "idle" | "user_typing" | "thinking" | "streaming" | "settling";

export type CoreEvent =
  | "TYPING_START"
  | "TYPING_STOP"
  | "THINKING_START"
  | "THINKING_END"
  | "STREAM_START"
  | "STREAM_END"
  | "TICK";

export interface CoreVital {
  /** Overall aliveness (0..1). Drives color, rotation speed, particle activity. */
  alive: number; // 0.35 idle → 1 streaming
  /** Energy pulse (0..1): momentary bumps for token arrivals. */
  pulse: number; // 0..1
  /** Camera breathing offset (−1..1). */
  breathe: number;
  /** Rotation speed baseline (rad/s). */
  rotation: number;
  /** How many scan lines / waves to render. 0 = none. */
  signals: number;
  /** Halo expansion radius (1 = resting, 1.6 = peak). */
  halo: number;
  /** State-specific chromatic accent weight. */
  chroma: number;
}

const ZERO: CoreVital = {
  alive: 0.36,
  pulse: 0,
  breathe: 0,
  rotation: 0.04, // very slow
  signals: 0,
  halo: 1,
  chroma: 0,
};

const STREAMING_INTENSITY: Record<string, CoreVital> = {
  base: {
    alive: 0.95,
    pulse: 0.4,
    breathe: 0.45,
    rotation: 0.18,
    signals: 5,
    halo: 1.4,
    chroma: 0.85,
  },
};

const THINKING_INTENSITY: CoreVital = {
  alive: 0.78,
  pulse: 0.2,
  breathe: 0.4,
  rotation: 0.12,
  signals: 3,
  halo: 1.2,
  chroma: 0.6,
};

const TYPING_INTENSITY: CoreVital = {
  alive: 0.6,
  pulse: 0.15,
  breathe: 0.25,
  rotation: 0.08,
  signals: 1,
  halo: 1.08,
  chroma: 0.4,
};

const IDLE_INTENSITY: CoreVital = {
  alive: 0.36,
  pulse: 0,
  breathe: 0.2,
  rotation: 0.04,
  signals: 0,
  halo: 1,
  chroma: 0,
};

export function reduceCore(
  prev: CoreState,
  event: CoreEvent,
): { state: CoreState; vital: CoreVital } {
  switch (prev) {
    case "idle":
      if (event === "TYPING_START") return { state: "user_typing", vital: TYPING_INTENSITY };
      if (event === "THINKING_START") return { state: "thinking", vital: THINKING_INTENSITY };
      if (event === "STREAM_START") return { state: "streaming", vital: STREAMING_INTENSITY.base };
      return { state: "idle", vital: IDLE_INTENSITY };

    case "user_typing":
      if (event === "TYPING_STOP") return { state: "settling", vital: TYPING_INTENSITY };
      if (event === "THINKING_START") return { state: "thinking", vital: THINKING_INTENSITY };
      return { state: "user_typing", vital: TYPING_INTENSITY };

    case "thinking":
      if (event === "STREAM_START") return { state: "streaming", vital: STREAMING_INTENSITY.base };
      if (event === "THINKING_END") return { state: "settling", vital: THINKING_INTENSITY };
      return { state: "thinking", vital: THINKING_INTENSITY };

    case "streaming":
      if (event === "STREAM_END") return { state: "settling", vital: STREAMING_INTENSITY.base };
      return { state: "streaming", vital: STREAMING_INTENSITY.base };

    case "settling":
      if (event === "TICK") return { state: "idle", vital: IDLE_INTENSITY };
      return { state: "settling", vital: IDLE_INTENSITY };

    default:
      return { state: "idle", vital: IDLE_INTENSITY };
  }
}

export const initialCore: { state: CoreState; vital: CoreVital } = {
  state: "idle",
  vital: IDLE_INTENSITY,
};

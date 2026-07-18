"use client";

/**
 * useCoreState — single source for the Living AI Core state.
 *
 *  - Subscribes to event stream via a small custom emitter.
 *  - Listens for keyboard / typing / streaming events emitted from page-level
 *    integrations.
 *  - Never imports React or browser globals at module top — only inside the hook.
 *
 *   This is intentionally a tiny pub/sub so it works in any tree depth and
 *   survives React 19 Strict Mode double-invocations.
 */

import * as React from "react";
import {
  reduceCore,
  initialCore,
  type CoreEvent,
  type CoreState,
  type CoreVital,
} from "./state-machine";

type Listener = (state: CoreState, vital: CoreVital) => void;

class CoreBus {
  private state: CoreState = initialCore.state;
  private vital: CoreVital = initialCore.vital;
  private listeners = new Set<Listener>();

  getState(): CoreState {
    return this.state;
  }

  getVital(): CoreVital {
    return this.vital;
  }

  emit(event: CoreEvent) {
    const next = reduceCore(this.state, event);
    this.state = next.state;
    this.vital = next.vital;
    this.listeners.forEach((l) => l(next.state, next.vital));
  }

  setVital(vital: CoreVital) {
    this.vital = vital;
    this.listeners.forEach((l) => l(this.state, this.vital));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state, this.vital);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const coreBus = new CoreBus();

/**
 * useCoreState — returns { state, vital } that updates with the bus.
 */
export function useCoreState(): { state: CoreState; vital: CoreVital } {
  const [snapshot, setSnapshot] = React.useState(() => ({
    state: coreBus.getState(),
    vital: coreBus.getVital(),
  }));

  React.useEffect(() => {
    return coreBus.subscribe((state, vital) => setSnapshot({ state, vital }));
  }, []);

  return snapshot;
}

/**
 * useCoreEmitter — emits a CoreEvent at will from anywhere.
 */
export function useCoreEmitter() {
  return React.useCallback((event: CoreEvent) => coreBus.emit(event), []);
}

/**
 * useCoreVitalPatch — for instant smoothie of certain vital scalars
 * (e.g. token-stream pulse bumps) without changing state.
 */
export function useCoreVitalPatch() {
  return React.useCallback((patch: Partial<CoreVital>) => {
    const v = coreBus.getVital();
    coreBus.setVital({
      alive: patch.alive ?? v.alive,
      pulse: patch.pulse ?? v.pulse,
      breathe: patch.breathe ?? v.breathe,
      rotation: patch.rotation ?? v.rotation,
      signals: patch.signals ?? v.signals,
      halo: patch.halo ?? v.halo,
      chroma: patch.chroma ?? v.chroma,
    });
  }, []);
}

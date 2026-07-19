"use client";

/**
 * selectionStore — global selection store.
 *
 * Tracks the currently focused app-document id (used by Library ↔
 * Knowledge Graph ↔ Mind Map cross-highlighting). Backed by an
 * internal pub/sub so subscribers re-render on change.
 */

import * as React from "react";

type Listener = (selected: string | null) => void;

class SelectionStore {
  private selected: string | null = null;
  private listeners = new Set<Listener>();
  private focusedChunkIndex: number | null = null;
  private chunkListeners = new Set<(chunk: number | null) => void>();

  get(): string | null {
    return this.selected;
  }

  getChunk(): number | null {
    return this.focusedChunkIndex;
  }

  set(id: string | null): void {
    if (this.selected === id) return;
    this.selected = id;
    this.focusedChunkIndex = null;
    this.listeners.forEach((l) => l(id));
    this.chunkListeners.forEach((l) => l(null));
  }

  setChunk(index: number | null): void {
    if (this.focusedChunkIndex === index) return;
    this.focusedChunkIndex = index;
    this.chunkListeners.forEach((l) => l(index));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.selected);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeChunk(listener: (chunk: number | null) => void): () => void {
    this.chunkListeners.add(listener);
    listener(this.focusedChunkIndex);
    return () => {
      this.chunkListeners.delete(listener);
    };
  }
}

export const selectionStore = new SelectionStore();

export function useSelectedDocument(): string | null {
  const [selected, setSelected] = React.useState<string | null>(selectionStore.get());
  React.useEffect(() => selectionStore.subscribe(setSelected), []);
  return selected;
}

export function useFocusedChunk(): number | null {
  const [chunk, setChunk] = React.useState<number | null>(selectionStore.getChunk());
  React.useEffect(() => selectionStore.subscribeChunk(setChunk), []);
  return chunk;
}

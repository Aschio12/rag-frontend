"use client";

/**
 * Per-panel empty-state composables that refactor existing `ComingSoonPanel`
 * usage to be premium, accessible and consistent. No placeholders.
 */

import * as React from "react";
import { PremiumEmpty, type PremiumEmptyProps } from "./PremiumEmpty";

export function EmptyLibrary({
  onImport,
  onClearFilter,
}: {
  onImport?: () => void;
  onClearFilter?: () => void;
}) {
  return (
    <PremiumEmpty
      shape="shelves"
      title="Library is hushed early"
      description="Drop documents to populate the knowledge base. Each will be indexed, chunked and remembered."
      action={
        onImport
          ? { label: "Open import", onClick: onImport }
          : onClearFilter
          ? { label: "Reset filters", onClick: onClearFilter }
          : undefined
      }
    />
  );
}

export function EmptyKnowledge() {
  return (
    <PremiumEmpty
      shape="graph"
      title="Graph is empty"
      description="Once documents are indexed, Aether will surface the concept graph it derived from them."
    />
  );
}

export function EmptyMindMap() {
  return (
    <PremiumEmpty
      shape="spiral"
      title="No branches yet"
      description="The mind map will appear once reasoning converges on a structure worth mapping."
    />
  );
}

export function EmptyAgentTimeline() {
  return (
    <PremiumEmpty
      shape="trail"
      title="No reasoning recorded"
      description="When Aether reasons across multiple phases, the cinematic timeline will replay here."
    />
  );
}

export function EmptyInspector() {
  return (
    <PremiumEmpty
      shape="panel"
      title="Nothing to inspect yet"
      description="Start a conversation to see sources, memory and tokens stream into the inspector."
      compact
    />
  );
}

export function EmptyCommandPalette() {
  return (
    <PremiumEmpty
      shape="loop"
      title="Stagehand at rest"
      description="Press ⌘K to invoke the stagehand, then type a verb to act."
      compact
    />
  );
}

export type { PremiumEmptyProps };

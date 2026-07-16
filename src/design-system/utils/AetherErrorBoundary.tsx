"use client";

import { Component, type ReactNode } from "react";

/**
 * Tiny class component error boundary for AETHER — surfaces copy,
 * keeps the shell alive even if a single feature crashes.
 */

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

export class AetherErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    if (typeof console !== "undefined") {
      console.error("[AETHER] Boundary caught", error, info);
    }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error);
      return (
        <div
          style={{
            padding: 24,
            color: "var(--aether-text-tertiary)",
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
          }}
        >
          <p style={{ marginBottom: 8, color: "var(--aether-text-secondary)" }}>
            Something on this screen couldn’t continue.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              border: "1px solid var(--aether-border-default)",
              background: "transparent",
              color: "var(--aether-text-primary)",
              padding: "6px 12px",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

"use client";

import * as React from "react";
import { darkThemeCss } from "./dark";
import { lightThemeCss } from "./light";

export type AetherTheme = "dark" | "light";

interface ThemeContextValue {
  theme: AetherTheme;
  setTheme: (theme: AetherTheme) => void;
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "aether-theme";

function readInitialTheme(): AetherTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return "dark";
}

export function AetherThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<AetherTheme>(readInitialTheme);

  const setTheme = React.useCallback((next: AetherTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const toggle = React.useCallback(() => {
    setThemeState((prev) => {
      const next: AetherTheme = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAetherTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useAetherTheme must be used within <AetherThemeProvider />");
  return ctx;
}

/**
 * Injects the dark + light token CSS exactly once.
 * Place in <head> or wrap the application root.
 */
export function AetherCssVars() {
  return (
    <style
      id="aether-theme-vars"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: `${darkThemeCss}\n${lightThemeCss}` }}
    />
  );
}

/**
 * Drop this once at the root to install both theme stylesheets.
 */
export function AetherThemeRoot({ children }: { children: React.ReactNode }) {
  return (
    <AetherThemeProvider>
      <AetherCssVars />
      {children}
    </AetherThemeProvider>
  );
}

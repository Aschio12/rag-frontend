import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { MotionConfig } from "framer-motion";
import { AnimatedPageTransition } from "@/components/animations/AnimatedPageTransition";
import { AetherThemeRoot } from "@/design-system/themes";
import { AmbientCanvasClient } from "@/design-system/effects/AmbientCanvasClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aether — An operating system for how you think with documents",
  description: "Premium AI workspace with ambient intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} h-full antialiased scroll-smooth`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen bg-[var(--aether-surface-canvas)] text-[var(--aether-text-primary)] selection:bg-[var(--aether-text-accent)] selection:text-[var(--aether-text-on-accent)]">
        <AetherThemeRoot>
          <Suspense fallback={null}>
            <AmbientCanvasClient />
          </Suspense>
          <MotionConfig reducedMotion="user">
            <ToastProvider>
              <AnimatedPageTransition>
                {children}
              </AnimatedPageTransition>
            </ToastProvider>
          </MotionConfig>
        </AetherThemeRoot>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { MotionConfig } from "framer-motion";
import { AnimatedPageTransition } from "@/components/animations/AnimatedPageTransition";
import dynamic from "next/dynamic";

const AmbientBackground = dynamic(
  () => import("@/components/ui/AmbientBackground").then((m) => ({ default: m.AmbientBackground })),
  { ssr: false },
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premium AI Workspace",
  description: "Futuristic AI Assistant with Kinetic Brutalism Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Suspense fallback={null}>
          <AmbientBackground />
        </Suspense>
        <MotionConfig reducedMotion="user">
          <ToastProvider>
            <AnimatedPageTransition>
              {children}
            </AnimatedPageTransition>
          </ToastProvider>
        </MotionConfig>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { AIChat } from "@/components/chat/AiChat";
import "./globals.css";

export const metadata: Metadata = {
  title: "RIMT Smart Campus Navigator",
  description:
    "AI-powered indoor + outdoor campus navigation for RIMT University. By Nikhil.",
  keywords: [
    "RIMT",
    "campus navigation",
    "indoor navigation",
    "AI",
    "smart campus",
  ],
};

export const viewport: Viewport = {
  themeColor: "#f8f9fc",   // matches --bg-1 (light)
  colorScheme: "light",    // no more dark mode forcing
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* No "dark" class — light theme is the default */
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Single font link — deduped */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ background: "var(--bg-1)" }}
      >
        {/*
          Navbar removed from layout — LandingPage has its own TopNav
          that is scroll-aware (transparent over hero → frosted on scroll).
          If other routes need a nav, add a separate layout inside /app/(routes)/layout.tsx
        */}
        {children}
        <AIChat />
      </body>
    </html>
  );
}
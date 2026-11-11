import type { Metadata, Viewport } from "next";
import { AIChat } from "@/components/chat/AiChat";
import { Navbar } from "@/components/layout/Navbar";
import IntroOverlay from "@/components/IntroOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parul University Campus Compass",
  description:
    "Campus navigation for Parul University, Vadodara, Gujarat, with indoor routing and campus intelligence.",
  keywords: [
    "campus navigation",
    "indoor navigation",
    "AI",
    "campus compass",
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
        <IntroOverlay>
          <Navbar />
          {children}
          <AIChat />
        </IntroOverlay>
      </body
>
    </html>
  );
}

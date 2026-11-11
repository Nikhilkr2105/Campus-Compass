"use client";

import { useCallback, useState, type ReactNode } from "react";
import CampusCompassIntro from "./CampusCompassIntro";

interface IntroOverlayProps {
  /** Your landing page (or app root) - mounts immediately, intro layers on top of it. */
  children: ReactNode;
}

/**
 * Plays the intro once per root layout mount: once on a fresh browser load or
 * refresh, but not on client-side route changes. It intentionally has no
 * storage or pathname trigger.
 *
 * The application (children) mounts immediately and stays mounted for the
 * entire lifetime of this component; the intro is purely a fullscreen
 * overlay on top of it that removes itself via local state once its own
 * fade-out finishes. No router involved, so no route change, no remount of
 * the page underneath, no blank screen at any point.
 */
export default function IntroOverlay({ children }: IntroOverlayProps) {
  const [showIntro, setShowIntro] = useState(true);
  const handleComplete = useCallback(() => setShowIntro(false), []);

  return (
    <>
      {children}
      {showIntro && <CampusCompassIntro onComplete={handleComplete} />}
    </>
  );
}

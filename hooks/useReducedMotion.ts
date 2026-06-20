import { useEffect, useState } from "react";

/**
 * Reports whether the user has requested reduced motion at the OS level,
 * and stays in sync if they change that setting while the app is open.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
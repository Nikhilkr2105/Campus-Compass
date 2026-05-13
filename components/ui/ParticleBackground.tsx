"use client";

import { useMemo } from "react";

interface Particle {
  id:      number;
  left:    string;
  size:    number;
  color:   string;
  opacity: number;
  dur:     number;
  delay:   number;
  dx:      number;
}

export function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id:      i,
      left:    `${(i / 28) * 100 + Math.sin(i) * 3}%`,
      size:    Math.sin(i * 1.7) * 1.2 + 1.8,
      color:   i % 3 === 0 ? "#00d4ff" : i % 3 === 1 ? "#8b5cf6" : "#3b82f6",
      opacity: Math.sin(i * 0.9) * 0.3 + 0.35,
      dur:     Math.sin(i * 1.1) * 3 + 9,
      delay:   (i * 0.45) % 12,
      dx:      Math.sin(i * 2.3) * 60,
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 bg-grid"
        style={{ opacity: 1 }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left:    p.left,
            width:   p.size,
            height:  p.size,
            background: p.color,
            opacity:    p.opacity,
            filter:     `blur(${p.size > 2.5 ? 0.5 : 0}px)`,
            // CSS custom properties for the animation
            ["--dx" as string]:    `${p.dx}px`,
            ["--dur" as string]:   `${p.dur}s`,
            ["--delay" as string]: `${p.delay}s`,
            animation: `particle-rise var(--dur) linear var(--delay) infinite`,
          }}
        />
      ))}
    </div>
  );
}
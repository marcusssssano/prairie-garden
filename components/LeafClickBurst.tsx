"use client";

import { useEffect, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  rotation: number;
  scale: number;
  color: string;
};

const COLORS = ["#A4B089", "#6B7A54", "#C98B5B"];
const ANIMATION_MS = 700;

let nextId = 0;

export default function LeafClickBurst() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Skip form controls — a burst on every keystroke-adjacent click
      // (checkboxes, text inputs) reads as noisy rather than delightful.
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;

      const count = 6;
      const newParticles: Particle[] = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 24 + Math.random() * 28;
        return {
          id: nextId++,
          x: e.clientX,
          y: e.clientY,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          rotation: Math.random() * 360 - 180,
          scale: 0.6 + Math.random() * 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
      });

      setParticles((prev) => [...prev, ...newParticles]);
      const ids = new Set(newParticles.map((p) => p.id));
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
      }, ANIMATION_MS);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 32 32"
          className="leaf-burst-particle absolute h-4 w-4"
          style={
            {
              left: p.x,
              top: p.y,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rotation": `${p.rotation}deg`,
              "--scale": p.scale,
            } as React.CSSProperties
          }
        >
          <path
            d="M4 28C4 16 12 4 28 4C28 20 20 28 4 28Z"
            fill={p.color}
          />
        </svg>
      ))}
    </div>
  );
}

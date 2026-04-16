"use client";

import { useEffect, useState } from "react";

import { FlipTicker } from "@/components/FlipTicker";

type Size = "2xs" | "xs" | "sm" | "default" | "lg" | "xl";
type Color = "charcoal" | "rust" | "cream" | "teal";
type Elevation = "none" | "l1" | "l2" | "l3" | "l4" | "l5";

export function CountTicker({
  value,
  behind,
  stepMs = 450,
  label,
  size = "2xs",
  color,
  elevation,
}: {
  value: number;
  behind?: number;
  stepMs?: number;
  label?: string;
  size?: Size;
  color?: Color;
  elevation?: Elevation;
}) {
  const start = behind !== undefined ? Math.max(0, value - behind) : value;
  const shouldAnimate = start < value;
  const digits = Math.max(2, String(value).length);

  const [displayed, setDisplayed] = useState(start);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) return;
    let current = start;
    setAnimate(true);
    const id = window.setInterval(() => {
      current += 1;
      setDisplayed(current);
      if (current >= value) window.clearInterval(id);
    }, stepMs);
    return () => window.clearInterval(id);
  }, [shouldAnimate, start, value, stepMs]);

  return (
    <span className="inline-flex items-center gap-2">
      <FlipTicker
        value={displayed}
        digits={digits}
        size={size}
        color={color}
        elevation={elevation}
        animate={animate}
      />
      {label && (
        <span className="text-sm leading-none tracking-wide text-muted-foreground inline-flex items-center">
          {label}
        </span>
      )}
    </span>
  );
}
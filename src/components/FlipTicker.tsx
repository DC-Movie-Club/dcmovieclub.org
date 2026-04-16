"use client";

import "@/styles/flip-ticker.css";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type FlipCellVariant = "2xs" | "xs" | "sm" | "default" | "lg" | "xl";
type FlipCellColor = "charcoal" | "rust" | "cream" | "teal";
type FlipElevation = "none" | "l1" | "l2" | "l3" | "l4" | "l5";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface FlipDigitProps {
  value: string;
  duration?: number;
  animate?: boolean;
  size?: FlipCellVariant;
  color?: FlipCellColor;
  elevation?: FlipElevation;
  dcmcFont?: boolean;
  className?: string;
}

export function FlipDigit({
  value,
  duration = 320,
  animate = true,
  size = "default",
  color = "charcoal",
  elevation = "none",
  dcmcFont = false,
  className,
}: FlipDigitProps) {
  const [displayed, setDisplayed] = useState(value);
  const [next, setNext] = useState<string | null>(null);
  const latestRef = useRef(value);
  latestRef.current = value;

  useIsoLayoutEffect(() => {
    if (!animate) {
      setDisplayed(value);
      setNext(null);
      return;
    }
    if (next !== null) return;
    if (displayed === value) return;
    setNext(value);
  }, [value, animate, displayed, next]);

  function handleAnimationEnd(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.animationName !== "flip-down") return;
    if (next === null) return;
    const settled = next;
    const latest = latestRef.current;
    setDisplayed(settled);
    setNext(animate && latest !== settled ? latest : null);
  }

  const flipping = next !== null;

  return (
    <div
      className={cn(
        "flip-cell",
        size === "2xs" && "flip-cell--2xs",
        size === "xs" && "flip-cell--xs",
        size === "sm" && "flip-cell--sm",
        size === "lg" && "flip-cell--lg",
        size === "xl" && "flip-cell--xl",
        color === "rust" && "flip-cell--rust",
        color === "cream" && "flip-cell--cream",
        color === "teal" && "flip-cell--teal",
        elevation === "l1" && "flip-cell--el1",
        elevation === "l2" && "flip-cell--el2",
        elevation === "l3" && "flip-cell--el3",
        elevation === "l4" && "flip-cell--el4",
        elevation === "l5" && "flip-cell--el5",
        dcmcFont && "flip-cell--dcmc",
        className,
      )}
      style={{ ["--flip-duration" as string]: `${duration}ms` }}
    >
      <div className="flip-top">{flipping ? next : displayed}</div>
      <div className="flip-bottom">{displayed}</div>
      <div className="flip-hinge" />
      {flipping && (
        <div
          key={`${displayed}->${next}`}
          className="flip-leaf"
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="flip-leaf-front">{displayed}</div>
          <div className="flip-leaf-rear">{next}</div>
        </div>
      )}
    </div>
  );
}

export interface FlipTickerProps {
  value: number;
  digits?: number;
  duration?: number;
  animate?: boolean;
  size?: FlipCellVariant;
  color?: FlipCellColor;
  elevation?: FlipElevation;
  dcmcFont?: boolean;
  stripes?: boolean;
  panel?: boolean;
  className?: string;
}

export function FlipTicker({
  value,
  digits = 4,
  duration = 320,
  animate = true,
  size = "default",
  color = "charcoal",
  elevation = "none",
  dcmcFont = false,
  stripes = false,
  panel = false,
  className,
}: FlipTickerProps) {
  const safe = Math.max(0, Math.floor(value));
  const padded = String(safe).padStart(digits, "0").slice(-digits);

  const row = (
    <div className={cn("flip-row", className)}>
      {padded.split("").map((ch, i) => (
        <FlipDigit
          key={i}
          value={ch}
          duration={duration}
          animate={animate}
          size={size}
          color={color}
          elevation={elevation}
          dcmcFont={dcmcFont}
        />
      ))}
    </div>
  );

  const content = stripes ? (
    <div className="inline-flex flex-col">
      {row}
      <div className="flip-stripes" />
    </div>
  ) : (
    row
  );

  if (panel) return <div className="flip-panel">{content}</div>;
  return content;
}
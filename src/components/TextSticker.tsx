"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const SHADOW_COLOR = "#6b2e06";

type PeelCorner = "tl" | "tr" | "bl" | "br";

export interface TextPeelConfig {
  corner?: PeelCorner;
  amount?: number;
  duration?: number;
  active?: boolean;
}

function useSmoothValue(target: number, duration: number) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  useEffect(() => {
    const start = valueRef.current;
    const startTime = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = start + (target - start) * eased;
      valueRef.current = v;
      setValue(v);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function TextPeel({
  children,
  fold,
  corner,
  duration,
}: {
  children: React.ReactNode;
  fold: number;
  corner: PeelCorner;
  duration: number;
}) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const animFold = useSmoothValue(fold, duration);

  useLayoutEffect(() => {
    if (measureRef.current) {
      setSize({
        w: measureRef.current.offsetWidth,
        h: measureRef.current.offsetHeight,
      });
    }
  }, [children]);

  if (!size) {
    return (
      <span ref={measureRef} style={{ display: "inline-block" }}>
        {children}
      </span>
    );
  }

  const { w, h } = size;
  const p = animFold * 0.55;
  const cut = p * Math.min(w, h);

  let frontClip = "";
  let flapClip = "";
  let mirrorTransform = "";

  switch (corner) {
    case "br": {
      const k = w + h - cut;
      frontClip = `polygon(0px 0px, ${w}px 0px, ${w}px ${h - cut}px, ${w - cut}px ${h}px, 0px ${h}px)`;
      flapClip = `polygon(${w - cut}px ${h}px, ${w}px ${h - cut}px, ${w}px ${h}px)`;
      mirrorTransform = `matrix(0, -1, -1, 0, ${k}, ${k})`;
      break;
    }
    case "bl": {
      const k = h - cut;
      frontClip = `polygon(0px 0px, ${w}px 0px, ${w}px ${h}px, ${cut}px ${h}px, 0px ${h - cut}px)`;
      flapClip = `polygon(0px ${h - cut}px, ${cut}px ${h}px, 0px ${h}px)`;
      mirrorTransform = `matrix(0, 1, 1, 0, ${-k}, ${k})`;
      break;
    }
    case "tr": {
      const k = w - cut;
      frontClip = `polygon(0px 0px, ${w - cut}px 0px, ${w}px ${cut}px, ${w}px ${h}px, 0px ${h}px)`;
      flapClip = `polygon(${w - cut}px 0px, ${w}px 0px, ${w}px ${cut}px)`;
      mirrorTransform = `matrix(0, 1, 1, 0, ${k}, ${-k})`;
      break;
    }
    case "tl": {
      const k = cut;
      frontClip = `polygon(${cut}px 0px, ${w}px 0px, ${w}px ${h}px, 0px ${h}px, 0px ${cut}px)`;
      flapClip = `polygon(0px 0px, ${cut}px 0px, 0px ${cut}px)`;
      mirrorTransform = `matrix(0, -1, -1, 0, ${k}, ${k})`;
      break;
    }
  }

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: w,
        height: h,
        overflow: "visible",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          display: "inline-block",
          clipPath: frontClip,
        }}
      >
        {children}
      </span>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          display: "inline-block",
          clipPath: flapClip,
          transform: mirrorTransform,
          transformOrigin: "0 0",
          filter: "brightness(0.55) saturate(0.6)",
        }}
      >
        {children}
      </span>
    </span>
  );
}

const elevations = {
  none: { key: "none" as const, layers: [] },
  l1: {
    key: "l1" as const,
    layers: [{ dy: 1, stdDev: 0.75, opacity: 0.12 }],
  },
  l2: {
    key: "l2" as const,
    layers: [
      { dy: 1, stdDev: 0.5, opacity: 0.075 },
      { dy: 2, stdDev: 2, opacity: 0.075 },
    ],
  },
  l3: {
    key: "l3" as const,
    layers: [
      { dy: 1, stdDev: 0.5, opacity: 0.06 },
      { dy: 2, stdDev: 2, opacity: 0.06 },
      { dy: 4, stdDev: 4, opacity: 0.06 },
    ],
  },
  l4: {
    key: "l4" as const,
    layers: [
      { dy: 1, stdDev: 0.5, opacity: 0.05 },
      { dy: 2, stdDev: 1, opacity: 0.05 },
      { dy: 4, stdDev: 2, opacity: 0.05 },
      { dy: 8, stdDev: 4, opacity: 0.05 },
    ],
  },
  l5: {
    key: "l5" as const,
    layers: [
      { dy: 1, stdDev: 0.5, opacity: 0.04 },
      { dy: 2, stdDev: 1, opacity: 0.04 },
      { dy: 4, stdDev: 2, opacity: 0.04 },
      { dy: 8, stdDev: 4, opacity: 0.04 },
      { dy: 16, stdDev: 8, opacity: 0.04 },
    ],
  },
};

type Elevation = keyof typeof elevations;

interface TextStickerProps {
  children: React.ReactNode;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  elevation?: Elevation;
  elevationHover?: Elevation;
  rotate?: number;
  className?: string;
  peel?: TextPeelConfig;
}

function buildShadowFilterSvg(
  id: string,
  layers: (typeof elevations)[Elevation]["layers"],
) {
  if (layers.length === 0) return "";

  let primitives = `<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="alpha"/>`;
  let mergeNodes = "";

  layers.forEach((layer, i) => {
    primitives += `
      <feGaussianBlur in="alpha" stdDeviation="${layer.stdDev}" result="blur${i}"/>
      <feOffset in="blur${i}" dy="${layer.dy}" result="offset${i}"/>
      <feFlood flood-color="${SHADOW_COLOR}" flood-opacity="${layer.opacity}" result="sColor${i}"/>
      <feComposite in="sColor${i}" in2="offset${i}" operator="in" result="shadow${i}"/>`;
    mergeNodes += `<feMergeNode in="shadow${i}"/>`;
  });

  primitives += `
    <feMerge>
      ${mergeNodes}
      <feMergeNode in="SourceGraphic"/>
    </feMerge>`;

  return `<svg aria-hidden="true" style="position:absolute;width:0;height:0">
    <defs>
      <filter id="${id}" x="-25%" y="-25%" width="150%" height="170%" filterUnits="objectBoundingBox">
        ${primitives}
      </filter>
    </defs>
  </svg>`;
}

export function TextSticker({
  children,
  color = "var(--color-teal)",
  strokeColor = "white",
  strokeWidth = 4,
  elevation = "none",
  elevationHover,
  rotate,
  className,
  peel,
}: TextStickerProps) {
  const rawId = useId();
  const baseFilterId = `text-sticker${rawId.replace(/:/g, "")}`;
  const hoverFilterId = `text-sticker-hover${rawId.replace(/:/g, "")}`;
  const baseLayers = elevations[elevation].layers;
  const hoverLayers = elevationHover ? elevations[elevationHover].layers : null;
  const hasBase = baseLayers.length > 0;
  const hasHover = hoverLayers !== null && hoverLayers.length > 0;

  const [hovered, setHovered] = useState(false);
  const activeFilterId = hasHover && hovered ? hoverFilterId : baseFilterId;

  const peelEnabled = peel !== undefined;
  const controlled = peelEnabled && peel.active !== undefined;
  const peeledNow = controlled ? !!peel.active : hovered;
  const fold = peelEnabled && peeledNow ? peel.amount ?? 0.5 : 0;

  const needsHoverHandler = hasHover || (peelEnabled && !controlled);

  return (
    <span
      className={cn("inline-block select-none", className)}
      style={{
        color,
        WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
        paintOrder: "stroke fill",
        filter: hasBase || hasHover ? `url(#${activeFilterId})` : undefined,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
      onMouseEnter={needsHoverHandler ? () => setHovered(true) : undefined}
      onMouseLeave={needsHoverHandler ? () => setHovered(false) : undefined}
    >
      {hasBase && (
        <span dangerouslySetInnerHTML={{ __html: buildShadowFilterSvg(baseFilterId, baseLayers) }} />
      )}
      {hasHover && (
        <span dangerouslySetInnerHTML={{ __html: buildShadowFilterSvg(hoverFilterId, hoverLayers) }} />
      )}
      {peelEnabled ? (
        <TextPeel
          fold={fold}
          corner={peel.corner ?? "br"}
          duration={peel.duration ?? 280}
        >
          {children}
        </TextPeel>
      ) : (
        children
      )}
    </span>
  );
}

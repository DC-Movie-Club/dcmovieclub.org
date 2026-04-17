"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

const SHADOW_COLOR = "#6b2e06";

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
      onMouseEnter={hasHover ? () => setHovered(true) : undefined}
      onMouseLeave={hasHover ? () => setHovered(false) : undefined}
    >
      {hasBase && (
        <span dangerouslySetInnerHTML={{ __html: buildShadowFilterSvg(baseFilterId, baseLayers) }} />
      )}
      {hasHover && (
        <span dangerouslySetInnerHTML={{ __html: buildShadowFilterSvg(hoverFilterId, hoverLayers) }} />
      )}
      {children}
    </span>
  );
}

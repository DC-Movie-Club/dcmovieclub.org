import { useId } from "react";
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

type TapeType = "scotch" | "washi";
type TapePosition =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right";

interface TapeConfig {
  type: TapeType;
  position: TapePosition;
  rotate?: number;
}

interface DieCutStickerProps {
  children: React.ReactNode;
  radius?: number;
  elevation?: Elevation;
  outlineColor?: string;
  tape?: TapeConfig;
  rotate?: number;
  className?: string;
}

function buildFilterSvg(
  id: string,
  radius: number,
  layers: (typeof elevations)[Elevation]["layers"],
  outlineColor: string,
) {
  const hasShadows = layers.length > 0;
  const stickerResult = hasShadows ? ' result="sticker"' : "";

  let shadowPrimitives = "";
  let shadowMergeNodes = "";

  if (hasShadows) {
    shadowPrimitives = `<feColorMatrix in="sticker" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="stickerAlpha"/>`;

    layers.forEach((layer, i) => {
      shadowPrimitives += `
        <feGaussianBlur in="stickerAlpha" stdDeviation="${layer.stdDev}" result="blur${i}"/>
        <feOffset in="blur${i}" dy="${layer.dy}" result="offset${i}"/>
        <feFlood flood-color="${SHADOW_COLOR}" flood-opacity="${layer.opacity}" result="sColor${i}"/>
        <feComposite in="sColor${i}" in2="offset${i}" operator="in" result="shadow${i}"/>`;
      shadowMergeNodes += `<feMergeNode in="shadow${i}"/>`;
    });

    shadowPrimitives += `
      <feMerge>
        ${shadowMergeNodes}
        <feMergeNode in="sticker"/>
      </feMerge>`;
  }

  return `<svg aria-hidden="true" style="position:absolute;width:0;height:0">
    <defs>
      <filter id="${id}" x="-25%" y="-20%" width="150%" height="160%" filterUnits="objectBoundingBox">
        <feMorphology operator="dilate" radius="${radius}" in="SourceAlpha" result="expanded"/>
        <feFlood flood-color="${outlineColor}" result="whiteFlood"/>
        <feComposite in="whiteFlood" in2="expanded" operator="in" result="outline"/>
        <feMerge${stickerResult}>
          <feMergeNode in="outline"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
        ${shadowPrimitives}
      </filter>
    </defs>
  </svg>`;
}

const tapeStyles: Record<TapeType, { background: string; width: number; height: number }> = {
  scotch: {
    background: "rgba(255,255,255,0.45)",
    width: 48,
    height: 16,
  },
  washi: {
    background:
      "repeating-linear-gradient(90deg, #e8cfc5, #e8cfc5 3px, #dfc2b3 3px, #dfc2b3 6px)",
    width: 56,
    height: 18,
  },
};

const tapePositions: Record<TapePosition, React.CSSProperties> = {
  top: { top: -8, left: "50%", transform: "translateX(-50%)" },
  "top-left": { top: -4, left: 8, transform: "rotate(-15deg)" },
  "top-right": { top: -4, right: 8, transform: "rotate(15deg)" },
  bottom: { bottom: -8, left: "50%", transform: "translateX(-50%)" },
  "bottom-left": { bottom: -4, left: 8, transform: "rotate(15deg)" },
  "bottom-right": { bottom: -4, right: 8, transform: "rotate(-15deg)" },
};

function Tape({ type, position, rotate }: TapeConfig) {
  const style = tapeStyles[type];
  const pos = { ...tapePositions[position] };

  if (rotate !== undefined) {
    const existing = (pos.transform as string) || "";
    pos.transform = existing
      ? existing.replace(/rotate\([^)]*\)/, `rotate(${rotate}deg)`)
      : `rotate(${rotate}deg)`;
  }

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        ...pos,
        width: style.width,
        height: style.height,
        background: style.background,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        opacity: type === "washi" ? 0.85 : 1,
      }}
    />
  );
}

export function DieCutSticker({
  children,
  radius = 4,
  elevation = "none",
  outlineColor = "white",
  tape,
  rotate,
  className,
}: DieCutStickerProps) {
  const rawId = useId();
  const filterId = `die-cut${rawId.replace(/:/g, "")}`;
  const layers = elevations[elevation].layers;

  return (
    <div
      className={cn("relative inline-block select-none", className)}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <div dangerouslySetInnerHTML={{ __html: buildFilterSvg(filterId, radius, layers, outlineColor) }} />
      <div className="pointer-events-none" style={{ filter: `url(#${filterId})` }}>
        {children}
      </div>
      {tape && <Tape {...tape} />}
    </div>
  );
}

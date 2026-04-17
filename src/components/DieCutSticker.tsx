"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Corner = "tl" | "tr" | "bl" | "br";

export interface PeelConfig {
  src?: string;
  size?: number;
  corner?: Corner;
  amount?: number;
  duration?: number;
  active?: boolean;
  backingColor?: string;
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

function PeelImage({
  src,
  size,
  fold,
  corner,
  duration,
}: {
  src: string;
  size: number;
  fold: number;
  corner: Corner;
  duration: number;
}) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const animFold = useSmoothValue(fold, duration);
  const p = animFold * 0.55;
  const cut = p * size;

  let frontPolygon = "";
  let flapPolygon = "";
  let reflectionMatrix = "";

  switch (corner) {
    case "br": {
      const c = 2 * size - cut;
      frontPolygon = `0,0 ${size},0 ${size},${size - cut} ${size - cut},${size} 0,${size}`;
      flapPolygon = `${size - cut},${size} ${size},${size - cut} ${size - cut},${size - cut}`;
      reflectionMatrix = `matrix(0 -1 -1 0 ${c} ${c})`;
      break;
    }
    case "bl": {
      const k = size - cut;
      frontPolygon = `0,0 ${size},0 ${size},${size} ${cut},${size} 0,${size - cut}`;
      flapPolygon = `0,${size - cut} ${cut},${size} ${cut},${size - cut}`;
      reflectionMatrix = `matrix(0 1 1 0 ${-k} ${k})`;
      break;
    }
    case "tr": {
      const k = size - cut;
      frontPolygon = `0,0 ${size - cut},0 ${size},${cut} ${size},${size} 0,${size}`;
      flapPolygon = `${size - cut},0 ${size},${cut} ${size - cut},${cut}`;
      reflectionMatrix = `matrix(0 1 1 0 ${k} ${-k})`;
      break;
    }
    case "tl": {
      frontPolygon = `${cut},0 ${size},0 ${size},${size} 0,${size} 0,${cut}`;
      flapPolygon = `${cut},0 0,${cut} ${cut},${cut}`;
      reflectionMatrix = `matrix(0 -1 -1 0 ${cut} ${cut})`;
      break;
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <clipPath id={`peel-front-${id}`}>
          <polygon points={frontPolygon} />
        </clipPath>
        <clipPath id={`peel-flap-${id}`}>
          <polygon points={flapPolygon} />
        </clipPath>
      </defs>
      <image
        href={src}
        x="0"
        y="0"
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#peel-front-${id})`}
      />
      <g clipPath={`url(#peel-flap-${id})`}>
        <image
          href={src}
          x="0"
          y="0"
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          transform={reflectionMatrix}
          style={{ filter: "brightness(0.55) saturate(0.6)" }}
        />
      </g>
    </svg>
  );
}

function cssPeelClips(corner: Corner, cutPct: number) {
  const c = `${cutPct}%`;
  const r = `${100 - cutPct}%`;

  switch (corner) {
    case "br":
      return {
        front: `polygon(0% 0%, 100% 0%, 100% ${r}, ${r} 100%, 0% 100%)`,
        flap: `polygon(${r} 100%, 100% ${r}, 100% 100%)`,
        flapGradient: "linear-gradient(225deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
      };
    case "bl":
      return {
        front: `polygon(0% 0%, 100% 0%, 100% 100%, ${c} 100%, 0% ${r})`,
        flap: `polygon(0% ${r}, ${c} 100%, 0% 100%)`,
        flapGradient: "linear-gradient(315deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
      };
    case "tr":
      return {
        front: `polygon(0% 0%, ${r} 0%, 100% ${c}, 100% 100%, 0% 100%)`,
        flap: `polygon(${r} 0%, 100% ${c}, 100% 0%)`,
        flapGradient: "linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
      };
    case "tl":
      return {
        front: `polygon(${c} 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${c})`,
        flap: `polygon(${c} 0%, 0% ${c}, 0% 0%)`,
        flapGradient: "linear-gradient(45deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
      };
  }
}

function CssPeel({
  children,
  fold,
  corner,
  duration,
  backingColor = "#e8e5d8",
}: {
  children: React.ReactNode;
  fold: number;
  corner: Corner;
  duration: number;
  backingColor?: string;
}) {
  const animFold = useSmoothValue(fold, duration);
  const cutPct = animFold * 30;
  const clips = cssPeelClips(corner, cutPct);

  return (
    <div className="relative">
      <div style={{ clipPath: clips.front }}>
        {children}
      </div>
      {cutPct > 0 && (
        <div
          className="absolute inset-0"
          style={{
            clipPath: clips.flap,
            backgroundColor: backingColor,
            backgroundImage: clips.flapGradient,
          }}
        />
      )}
    </div>
  );
}

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
  elevationHover?: Elevation;
  outlineColor?: string;
  tape?: TapeConfig;
  rotate?: number;
  className?: string;
  peel?: PeelConfig;
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
  elevationHover,
  outlineColor = "white",
  tape,
  rotate,
  className,
  peel,
}: DieCutStickerProps) {
  const rawId = useId();
  const baseFilterId = `die-cut${rawId.replace(/:/g, "")}`;
  const hoverFilterId = `die-cut-hover${rawId.replace(/:/g, "")}`;
  const baseLayers = elevations[elevation].layers;
  const hoverLayers = elevationHover ? elevations[elevationHover].layers : null;

  const [hovered, setHovered] = useState(false);
  const peelEnabled = peel !== undefined;
  const controlled = peelEnabled && peel.active !== undefined;
  const peeledNow = controlled ? !!peel.active : hovered;
  const fold = peelEnabled && peeledNow ? peel.amount ?? 0.5 : 0;

  const needsHover = !!elevationHover || (peelEnabled && !controlled);
  const activeFilterId = elevationHover && hovered ? hoverFilterId : baseFilterId;

  return (
    <div
      className={cn("relative inline-block select-none", className)}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      onMouseEnter={needsHover ? () => setHovered(true) : undefined}
      onMouseLeave={needsHover ? () => setHovered(false) : undefined}
    >
      <div dangerouslySetInnerHTML={{
        __html:
          buildFilterSvg(baseFilterId, radius, baseLayers, outlineColor) +
          (hoverLayers ? buildFilterSvg(hoverFilterId, radius, hoverLayers, outlineColor) : ""),
      }} />
      <div className="pointer-events-none" style={{ filter: `url(#${activeFilterId})` }}>
        {peelEnabled && peel.src ? (
          <PeelImage
            src={peel.src}
            size={peel.size ?? 200}
            corner={peel.corner ?? "br"}
            duration={peel.duration ?? 280}
            fold={fold}
          />
        ) : peelEnabled ? (
          <CssPeel
            fold={fold}
            corner={peel.corner ?? "br"}
            duration={peel.duration ?? 280}
            backingColor={peel.backingColor}
          >
            {children}
          </CssPeel>
        ) : (
          children
        )}
      </div>
      {tape && <Tape {...tape} />}
    </div>
  );
}

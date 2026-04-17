"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DEG = Math.PI / 180;

type Corner = "tl" | "tr" | "bl" | "br";

export interface RectPeelConfig {
  corner?: Corner;
  amount?: number;
  duration?: number;
  active?: boolean;
  startDelay?: number;
  backingColor?: string;
  curlShading?: boolean;
}

const SHADOW_RGB = "107, 46, 6";

const elevations = {
  none: "none",
  l1: `0 1px 1.5px rgba(${SHADOW_RGB}, 0.12)`,
  l2: [
    `0 1px 1px rgba(${SHADOW_RGB}, 0.075)`,
    `0 2px 4px rgba(${SHADOW_RGB}, 0.075)`,
  ].join(", "),
  l3: [
    `0 1px 1px rgba(${SHADOW_RGB}, 0.06)`,
    `0 2px 4px rgba(${SHADOW_RGB}, 0.06)`,
    `0 4px 8px rgba(${SHADOW_RGB}, 0.06)`,
  ].join(", "),
  l4: [
    `0 1px 1px rgba(${SHADOW_RGB}, 0.05)`,
    `0 2px 2px rgba(${SHADOW_RGB}, 0.05)`,
    `0 4px 4px rgba(${SHADOW_RGB}, 0.05)`,
    `0 8px 8px rgba(${SHADOW_RGB}, 0.05)`,
  ].join(", "),
  l5: [
    `0 1px 1px rgba(${SHADOW_RGB}, 0.04)`,
    `0 2px 2px rgba(${SHADOW_RGB}, 0.04)`,
    `0 4px 4px rgba(${SHADOW_RGB}, 0.04)`,
    `0 8px 8px rgba(${SHADOW_RGB}, 0.04)`,
    `0 16px 16px rgba(${SHADOW_RGB}, 0.04)`,
  ].join(", "),
};

type Elevation = keyof typeof elevations;

const cornerPeelAngles: Record<Corner, number> = {
  tl: 45,
  tr: 135,
  bl: -45,
  br: -135,
};

function computePeelStyles({
  width,
  height,
  peelAngle,
  peel,
  borderRadius,
}: {
  width: number;
  height: number;
  peelAngle: number;
  peel: number;
  borderRadius: number;
}) {
  const size = Math.sqrt(width * width + height * height);
  const offsetTop = (size - height) / 2;
  const offsetLeft = (size - width) / 2;

  let rotationAngleFix = 90 - peelAngle;
  if (peelAngle > 90) rotationAngleFix = peelAngle - 90;
  else if (peelAngle < -90) rotationAngleFix = 270 - peelAngle;
  else if (peelAngle < 0) rotationAngleFix = peelAngle + 90;

  let borderAngleFix = peelAngle;
  if (peelAngle > 90) borderAngleFix = peelAngle - 90;
  else if (peelAngle < -90) borderAngleFix = peelAngle;
  else if (peelAngle < 0) borderAngleFix = peelAngle - 90;

  const diagonalAngle = (Math.atan(height / width) * 180) / Math.PI;
  const angleFix = rotationAngleFix + diagonalAngle;
  const angleFixBack = peelAngle + 180;

  const offsetDiagonalAngle = (size - Math.sin(angleFix * DEG) * size) / 2;
  const offsetBorderRadiusBase = borderRadius * Math.SQRT2 - borderRadius;
  const offsetBorderRadius =
    offsetBorderRadiusBase * Math.sin(borderAngleFix * 2 * DEG);
  const offset = offsetDiagonalAngle + offsetBorderRadius;
  const offsetBack = offset - size;
  const peelTranslate = (size - offset * 2) * peel;

  const clipX = offset + peelTranslate;
  const frontFactor = -offset - peelTranslate;
  const frontX = frontFactor * Math.cos(peelAngle * DEG);
  const frontY = frontFactor * Math.sin(peelAngle * DEG);

  const backOs = offsetBack + peelTranslate;
  const backX = backOs * Math.cos(angleFixBack * DEG);
  const backY = backOs * Math.sin(angleFixBack * DEG);

  return {
    container: {
      width: size,
      height: size,
      top: -offsetTop,
      left: -offsetLeft,
      position: "absolute" as const,
    },
    wrapper: {
      width: size,
      height: size,
      transform: `rotate(${peelAngle}deg)`,
      position: "absolute" as const,
      top: 0,
      left: 0,
    },
    clip: {
      width: size,
      height: size,
      transform: `translateX(${clipX}px)`,
      position: "absolute" as const,
      top: 0,
      left: 0,
      overflow: "hidden" as const,
    },
    front: {
      left: offsetLeft,
      top: offsetTop,
      width,
      height,
      boxSizing: "border-box" as const,
      borderRadius,
      transform: `rotate(${-peelAngle}deg) translateX(${frontX}px) translateY(${frontY}px)`,
      position: "absolute" as const,
    },
    back: {
      left: offsetLeft,
      top: offsetTop,
      width,
      height,
      boxSizing: "border-box" as const,
      borderRadius,
      transform: `rotate(${angleFixBack}deg) translateX(${backX}px) translateY(${-backY}px)`,
      position: "absolute" as const,
    },
  };
}

interface RectStickerProps {
  children: React.ReactNode;
  width: number;
  height: number;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  elevation?: Elevation;
  elevationHover?: Elevation;
  rotate?: number;
  className?: string;
  peel?: RectPeelConfig;
}

export function RectSticker({
  children,
  width,
  height,
  borderColor = "white",
  borderWidth = 6,
  radius = 0,
  elevation = "none",
  elevationHover,
  rotate,
  className,
  peel,
}: RectStickerProps) {
  const [hovered, setHovered] = useState(false);
  const [autoActive, setAutoActive] = useState(false);

  const peelEnabled = peel !== undefined;
  const controlled = peelEnabled && peel.active !== undefined;
  const hasAutoStart = peelEnabled && peel.startDelay !== undefined;

  useEffect(() => {
    if (!hasAutoStart) return;
    const t = setTimeout(() => setAutoActive(true), peel!.startDelay);
    return () => clearTimeout(t);
  }, [hasAutoStart, peel]);

  const peeledNow = controlled
    ? !!peel.active
    : hasAutoStart
      ? autoActive
      : hovered;
  const fold = peelEnabled && peeledNow ? peel.amount ?? 0.15 : 0;
  const duration = peel?.duration ?? 280;
  const corner = peel?.corner ?? "br";
  const backingColor = peel?.backingColor ?? "#e8e5d8";
  const curlShading = peel?.curlShading ?? true;
  const peelAngle = cornerPeelAngles[corner];

  const shadowKey = elevationHover && hovered ? elevationHover : elevation;
  const activeShadow = elevations[shadowKey];
  const needsHover =
    !!elevationHover || (peelEnabled && !controlled && !hasAutoStart);

  const outerWidth = width + borderWidth * 2;
  const outerHeight = height + borderWidth * 2;

  if (!peelEnabled) {
    return (
      <div
        className={cn("relative inline-block select-none", className)}
        style={{
          width: outerWidth,
          height: outerHeight,
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
        }}
        onMouseEnter={needsHover ? () => setHovered(true) : undefined}
        onMouseLeave={needsHover ? () => setHovered(false) : undefined}
      >
        <div
          className="pointer-events-none"
          style={{
            width: outerWidth,
            height: outerHeight,
            boxSizing: "border-box",
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius: radius,
            boxShadow: activeShadow,
            overflow: "hidden",
            transition: elevationHover
              ? "box-shadow 200ms ease-out"
              : undefined,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  const s = computePeelStyles({
    width: outerWidth,
    height: outerHeight,
    peelAngle,
    peel: fold,
    borderRadius: radius,
  });

  const backBg = curlShading
    ? `linear-gradient(${peelAngle + 90}deg,
        rgba(0,0,0,0.22) 0%,
        rgba(0,0,0,0) 35%,
        rgba(255,255,255,0) 70%,
        rgba(255,255,255,0.25) 100%), ${backingColor}`
    : backingColor;

  const liftShadow = `${-3 * Math.cos(peelAngle * DEG)}px ${-3 * Math.sin(peelAngle * DEG)}px ${14 * fold}px rgba(0,0,0,${0.35 * fold})`;

  return (
    <div
      className={cn("relative inline-block select-none", className)}
      style={{
        width: outerWidth,
        height: outerHeight,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
      onMouseEnter={needsHover ? () => setHovered(true) : undefined}
      onMouseLeave={needsHover ? () => setHovered(false) : undefined}
    >
      <div className="pointer-events-none" style={s.container}>
        <div style={s.wrapper}>
          <div
            style={{
              ...s.clip,
              transition: `transform ${duration}ms ease-in-out`,
            }}
          >
            <div
              style={{
                ...s.front,
                border: `${borderWidth}px solid ${borderColor}`,
                boxShadow: activeShadow,
                overflow: "hidden",
                backfaceVisibility: "hidden",
                transition: `transform ${duration}ms ease-in-out, box-shadow 200ms ease-out`,
              }}
            >
              {children}
            </div>
            <div
              style={{
                ...s.back,
                background: backBg,
                backfaceVisibility: "hidden",
                boxShadow: liftShadow,
                transition: `transform ${duration}ms ease-in-out, box-shadow ${duration}ms ease-in-out`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

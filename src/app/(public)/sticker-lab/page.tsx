"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DieCutSticker } from "@/components/DieCutSticker";

const DEG = Math.PI / 180;

type Corner = "tl" | "tr" | "bl" | "br";

function useSmoothValue(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  useEffect(() => {
    const start = valueRef.current;
    const startTime = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 0.5 - Math.cos(t * Math.PI) / 2;
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

function computePeelStyles({
  width,
  height,
  peelAngle,
  peel,
  borderRadius = 0,
}: {
  width: number;
  height: number;
  peelAngle: number;
  peel: number;
  borderRadius?: number;
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
      borderRadius,
      transform: `rotate(${-peelAngle}deg) translateX(${frontX}px) translateY(${frontY}px)`,
      position: "absolute" as const,
    },
    back: {
      left: offsetLeft,
      top: offsetTop,
      width,
      height,
      borderRadius,
      transform: `rotate(${angleFixBack}deg) translateX(${backX}px) translateY(${-backY}px)`,
      position: "absolute" as const,
    },
  };
}

interface SlidePeelProps {
  width?: number;
  height?: number;
  peelAngle?: number;
  peel: number;
  color?: string;
  backColor?: string;
  borderRadius?: number;
  duration?: number;
  curlShading?: boolean;
  children?: React.ReactNode;
}

function SlidePeel({
  width = 180,
  height = 180,
  peelAngle = 45,
  peel,
  color = "#ca6c84",
  backColor = "#efecdf",
  borderRadius = 8,
  duration = 500,
  curlShading = true,
  children,
}: SlidePeelProps) {
  const s = computePeelStyles({ width, height, peelAngle, peel, borderRadius });

  const backBg = curlShading
    ? `linear-gradient(${peelAngle + 90}deg,
        rgba(0,0,0,0.22) 0%,
        ${backColor} 35%,
        ${backColor} 70%,
        rgba(255,255,255,0.25) 100%)`
    : backColor;

  return (
    <div className="relative" style={{ width, height }}>
      <div style={s.container}>
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
                background: color,
                zIndex: 1,
                transition: `transform ${duration}ms ease-in-out`,
                backfaceVisibility: "hidden",
                overflow: "hidden",
              }}
            >
              {children}
            </div>
            <div
              style={{
                ...s.back,
                background: backBg,
                zIndex: 2,
                transition: `transform ${duration}ms ease-in-out, box-shadow ${duration}ms ease-in-out`,
                boxShadow:
                  peel > 0.02
                    ? `${-3 * Math.cos(peelAngle * DEG)}px ${-3 * Math.sin(peelAngle * DEG)}px ${14 * peel}px rgba(0,0,0,${0.35 * peel})`
                    : "none",
                backfaceVisibility: "hidden",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface GradientCurlProps {
  size?: number;
  curl: number;
  corner?: Corner;
  color?: string;
  duration?: number;
}

function GradientCurl({
  size = 180,
  curl,
  corner = "br",
  color = "#ca6c84",
  duration = 500,
}: GradientCurlProps) {
  const curlPx = curl * size * 0.55;

  const curlPos: React.CSSProperties = {
    br: { bottom: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    tr: { top: 0, right: 0 },
    tl: { top: 0, left: 0 },
  }[corner];

  const curlGradient = {
    br: `linear-gradient(225deg,
        transparent 0%,
        transparent 45%,
        rgba(255,255,255,0.9) 50%,
        #c8c4b0 60%,
        #8a8676 90%,
        #6a6656 100%)`,
    bl: `linear-gradient(135deg,
        transparent 0%,
        transparent 45%,
        rgba(255,255,255,0.9) 50%,
        #c8c4b0 60%,
        #8a8676 90%,
        #6a6656 100%)`,
    tr: `linear-gradient(315deg,
        transparent 0%,
        transparent 45%,
        rgba(255,255,255,0.9) 50%,
        #c8c4b0 60%,
        #8a8676 90%,
        #6a6656 100%)`,
    tl: `linear-gradient(45deg,
        transparent 0%,
        transparent 45%,
        rgba(255,255,255,0.9) 50%,
        #c8c4b0 60%,
        #8a8676 90%,
        #6a6656 100%)`,
  }[corner];

  const shadowOffset = {
    br: `-6px 6px 12px -3px rgba(0,0,0,0.45)`,
    bl: `6px 6px 12px -3px rgba(0,0,0,0.45)`,
    tr: `-6px -6px 12px -3px rgba(0,0,0,0.45)`,
    tl: `6px -6px 12px -3px rgba(0,0,0,0.45)`,
  }[corner];

  const bodyClip = {
    br: `polygon(0 0, 100% 0, 100% calc(100% - ${curlPx}px), calc(100% - ${curlPx}px) 100%, 0 100%)`,
    bl: `polygon(0 0, 100% 0, 100% 100%, ${curlPx}px 100%, 0 calc(100% - ${curlPx}px))`,
    tr: `polygon(0 0, calc(100% - ${curlPx}px) 0, 100% ${curlPx}px, 100% 100%, 0 100%)`,
    tl: `polygon(${curlPx}px 0, 100% 0, 100% 100%, 0 100%, 0 ${curlPx}px)`,
  }[corner];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-md"
        style={{
          background: color,
          clipPath: curl > 0.02 ? bodyClip : undefined,
          boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)",
          transition: `clip-path ${duration}ms ease-in-out`,
        }}
      />
      <div
        className="absolute"
        style={{
          ...curlPos,
          width: curlPx,
          height: curlPx,
          background: curlGradient,
          boxShadow: curl > 0.02 ? shadowOffset : "none",
          transition: `width ${duration}ms ease-in-out, height ${duration}ms ease-in-out, box-shadow ${duration}ms ease-in-out`,
        }}
      />
    </div>
  );
}

interface GiraudelFoldProps {
  size?: number;
  fold: number;
  corner?: Corner;
  color?: string;
  underColor?: string;
  duration?: number;
}

function GiraudelFold({
  size = 180,
  fold,
  corner = "br",
  color = "#ca6c84",
  underColor = "#efecdf",
  duration = 500,
}: GiraudelFoldProps) {
  const t = fold * 55;

  const config = {
    br: {
      bodyClip: `polygon(0% 0%, 100% 0%, 100% ${100 - t}%, ${100 - t}% 100%, 0% 100%)`,
      flapClip: `polygon(100% ${100 - t}%, ${100 - t}% 100%, ${100 - t}% ${100 - t}%)`,
      shadowClip: `polygon(100% ${100 - t}%, ${100 - t}% 100%, ${Math.max(0, 100 - t - 2)}% ${Math.max(0, 100 - t - 2)}%)`,
      gradient: `linear-gradient(135deg, #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
    bl: {
      bodyClip: `polygon(0% 0%, 100% 0%, 100% 100%, ${t}% 100%, 0% ${100 - t}%)`,
      flapClip: `polygon(0% ${100 - t}%, ${t}% 100%, ${t}% ${100 - t}%)`,
      shadowClip: `polygon(0% ${100 - t}%, ${t}% 100%, ${Math.min(100, t + 2)}% ${Math.max(0, 100 - t - 2)}%)`,
      gradient: `linear-gradient(225deg, #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
    tr: {
      bodyClip: `polygon(0% 0%, ${100 - t}% 0%, 100% ${t}%, 100% 100%, 0% 100%)`,
      flapClip: `polygon(${100 - t}% 0%, 100% ${t}%, ${100 - t}% ${t}%)`,
      shadowClip: `polygon(${100 - t}% 0%, 100% ${t}%, ${Math.max(0, 100 - t - 2)}% ${Math.min(100, t + 2)}%)`,
      gradient: `linear-gradient(45deg, #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
    tl: {
      bodyClip: `polygon(${t}% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${t}%)`,
      flapClip: `polygon(${t}% 0%, 0% ${t}%, ${t}% ${t}%)`,
      shadowClip: `polygon(${t}% 0%, 0% ${t}%, ${Math.min(100, t + 2)}% ${Math.min(100, t + 2)}%)`,
      gradient: `linear-gradient(315deg, #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
  }[corner];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-md"
        style={{
          background: color,
          clipPath: config.bodyClip,
          boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)",
          transition: `clip-path ${duration}ms ease-in-out`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.45)",
          clipPath: config.shadowClip,
          filter: "blur(3px)",
          transition: `clip-path ${duration}ms ease-in-out`,
        }}
      />
      <div
        className="absolute inset-0 rounded-md"
        style={{
          background: config.gradient,
          clipPath: config.flapClip,
          transition: `clip-path ${duration}ms ease-in-out`,
        }}
      />
    </div>
  );
}

interface SvgPathCurlProps {
  size?: number;
  fold: number;
  corner?: Corner;
  color?: string;
  duration?: number;
}

function SvgPathCurl({
  size = 180,
  fold,
  corner = "br",
  color = "#ca6c84",
  duration = 500,
}: SvgPathCurlProps) {
  const animFold = useSmoothValue(fold, duration);
  const t = animFold * size * 0.5;
  const pad = 12;
  const W = size + pad * 2;

  const corners = {
    br: { ax: size, ay: size - t, bx: size - t, by: size },
    bl: { ax: 0, ay: size - t, bx: t, by: size },
    tr: { ax: size, ay: t, bx: size - t, by: 0 },
    tl: { ax: 0, ay: t, bx: t, by: 0 },
  }[corner];

  const cornerPt = {
    br: { x: size, y: size },
    bl: { x: 0, y: size },
    tr: { x: size, y: 0 },
    tl: { x: 0, y: 0 },
  }[corner];

  const inward = {
    br: { x: -1, y: -1 },
    bl: { x: 1, y: -1 },
    tr: { x: -1, y: 1 },
    tl: { x: 1, y: 1 },
  }[corner];

  const tipX = cornerPt.x + inward.x * t * 1.1;
  const tipY = cornerPt.y + inward.y * t * 1.1;

  const c1x = corners.ax + inward.x * t * 0.3;
  const c1y = corners.ay + inward.y * t * 0.3;
  const c2x = tipX + (corners.ax - cornerPt.x) * 0.4;
  const c2y = tipY + (corners.ay - cornerPt.y) * 0.4;
  const c3x = tipX + (corners.bx - cornerPt.x) * 0.4;
  const c3y = tipY + (corners.by - cornerPt.y) * 0.4;
  const c4x = corners.bx + inward.x * t * 0.3;
  const c4y = corners.by + inward.y * t * 0.3;

  const bodyPath = (() => {
    if (corner === "br")
      return `M 0 0 L ${size} 0 L ${corners.ax} ${corners.ay} Q ${cornerPt.x - t / 2} ${cornerPt.y - t / 2} ${corners.bx} ${corners.by} L 0 ${size} Z`;
    if (corner === "bl")
      return `M ${size} 0 L ${size} ${size} L ${corners.bx} ${corners.by} Q ${cornerPt.x + t / 2} ${cornerPt.y - t / 2} ${corners.ax} ${corners.ay} L 0 0 Z`;
    if (corner === "tr")
      return `M 0 ${size} L 0 0 L ${corners.bx} ${corners.by} Q ${cornerPt.x - t / 2} ${cornerPt.y + t / 2} ${corners.ax} ${corners.ay} L ${size} ${size} Z`;
    return `M ${size} ${size} L 0 ${size} L ${corners.ax} ${corners.ay} Q ${cornerPt.x + t / 2} ${cornerPt.y + t / 2} ${corners.bx} ${corners.by} L ${size} 0 Z`;
  })();

  const curlPath = `M ${corners.ax} ${corners.ay} C ${c1x} ${c1y} ${c2x} ${c2y} ${tipX} ${tipY} C ${c3x} ${c3y} ${c4x} ${c4y} ${corners.bx} ${corners.by} Z`;

  const gradAngle = {
    br: { x1: "100%", y1: "100%", x2: "0%", y2: "0%" },
    bl: { x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
    tr: { x1: "100%", y1: "0%", x2: "0%", y2: "100%" },
    tl: { x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
  }[corner];

  const gradId = `svg-curl-grad-${corner}`;
  const shadowId = `svg-curl-shadow-${corner}`;

  return (
    <svg
      width={W}
      height={W}
      viewBox={`${-pad} ${-pad} ${W} ${W}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} {...gradAngle}>
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="40%" stopColor="#d8d4c0" />
          <stop offset="80%" stopColor="#8a8676" />
          <stop offset="100%" stopColor="#4a4636" />
        </linearGradient>
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={2 + t * 0.05} />
          <feOffset
            dx={inward.x * -2}
            dy={inward.y * -2}
            result="offsetblur"
          />
          <feFlood floodColor="black" floodOpacity={0.35} />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={bodyPath}
        fill={color}
        style={{
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))",
        }}
      />
      {animFold > 0.02 && (
        <path d={curlPath} fill={`url(#${gradId})`} filter={`url(#${shadowId})`} />
      )}
    </svg>
  );
}

interface MirroredFlapProps {
  width?: number;
  height?: number;
  peel: number;
  color?: string;
  duration?: number;
  edge?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}

function MirroredFlap({
  width = 180,
  height = 180,
  peel,
  color = "#ca6c84",
  duration = 500,
  edge = "top",
  children,
}: MirroredFlapProps) {
  const p = peel * 50;

  const config = {
    top: {
      bodyClip: `polygon(0% ${p}%, 100% ${p}%, 100% 100%, 0% 100%)`,
      flapClip: `polygon(0% ${100 - p}%, 100% ${100 - p}%, 100% 100%, 0% 100%)`,
      flapStyle: {
        top: `calc(-100% + ${2 * p}% - 1px)`,
        left: 0,
        width: "100%",
        height: "100%",
        transform: "scaleY(-1)",
      } as React.CSSProperties,
      flapTransition: `top ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
    bottom: {
      bodyClip: `polygon(0% 0%, 100% 0%, 100% ${100 - p}%, 0% ${100 - p}%)`,
      flapClip: `polygon(0% 0%, 100% 0%, 100% ${p}%, 0% ${p}%)`,
      flapStyle: {
        top: `calc(100% - ${2 * p}% + 1px)`,
        left: 0,
        width: "100%",
        height: "100%",
        transform: "scaleY(-1)",
      } as React.CSSProperties,
      flapTransition: `top ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
    left: {
      bodyClip: `polygon(${p}% 0%, 100% 0%, 100% 100%, ${p}% 100%)`,
      flapClip: `polygon(${100 - p}% 0%, 100% 0%, 100% 100%, ${100 - p}% 100%)`,
      flapStyle: {
        left: `calc(-100% + ${2 * p}% - 1px)`,
        top: 0,
        width: "100%",
        height: "100%",
        transform: "scaleX(-1)",
      } as React.CSSProperties,
      flapTransition: `left ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
    right: {
      bodyClip: `polygon(0% 0%, ${100 - p}% 0%, ${100 - p}% 100%, 0% 100%)`,
      flapClip: `polygon(0% 0%, ${p}% 0%, ${p}% 100%, 0% 100%)`,
      flapStyle: {
        left: `calc(100% - ${2 * p}% + 1px)`,
        top: 0,
        width: "100%",
        height: "100%",
        transform: "scaleX(-1)",
      } as React.CSSProperties,
      flapTransition: `left ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
  }[edge];

  return (
    <div className="relative" style={{ width, height }}>
      <div
        className="absolute inset-0 overflow-hidden rounded-md"
        style={{
          background: color,
          clipPath: config.bodyClip,
          transition: `clip-path ${duration}ms ease-in-out`,
          boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)",
        }}
      >
        {children}
      </div>
      <div
        className="absolute overflow-hidden rounded-md"
        style={{
          ...config.flapStyle,
          background: color,
          clipPath: config.flapClip,
          transition: config.flapTransition,
          filter: "brightness(1.25) saturate(0.6)",
          boxShadow:
            peel > 0.02 ? "0 6px 14px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface RotatedFlapProps {
  size?: number;
  peel: number;
  corner?: Corner;
  color?: string;
  underColor?: string;
  duration?: number;
}

function RotatedFlap({
  size = 180,
  peel,
  corner = "br",
  color = "#ca6c84",
  underColor = "#efecdf",
  duration = 500,
}: RotatedFlapProps) {
  const fold = size * 0.45;
  const angle = peel * 170;

  const config = {
    br: {
      bodyClip: `polygon(0 0, 100% 0, 100% calc(100% - ${fold}px), calc(100% - ${fold}px) 100%, 0 100%)`,
      flapPos: { bottom: 0, right: 0 } as React.CSSProperties,
      flapClip: "polygon(100% 0, 100% 100%, 0 100%)",
      axis: "1, -1, 0",
      sign: 1,
      shadowDx: -2,
      shadowDy: -2,
    },
    bl: {
      bodyClip: `polygon(0 0, 100% 0, 100% 100%, ${fold}px 100%, 0 calc(100% - ${fold}px))`,
      flapPos: { bottom: 0, left: 0 } as React.CSSProperties,
      flapClip: "polygon(0 0, 100% 100%, 0 100%)",
      axis: "1, 1, 0",
      sign: -1,
      shadowDx: 2,
      shadowDy: -2,
    },
    tr: {
      bodyClip: `polygon(0 0, calc(100% - ${fold}px) 0, 100% ${fold}px, 100% 100%, 0 100%)`,
      flapPos: { top: 0, right: 0 } as React.CSSProperties,
      flapClip: "polygon(0 0, 100% 0, 100% 100%)",
      axis: "1, 1, 0",
      sign: 1,
      shadowDx: -2,
      shadowDy: 2,
    },
    tl: {
      bodyClip: `polygon(${fold}px 0, 100% 0, 100% 100%, 0 100%, 0 ${fold}px)`,
      flapPos: { top: 0, left: 0 } as React.CSSProperties,
      flapClip: "polygon(0 0, 100% 0, 0 100%)",
      axis: "1, -1, 0",
      sign: -1,
      shadowDx: 2,
      shadowDy: 2,
    },
  }[corner];

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        perspective: "800px",
      }}
    >
      <div
        className="absolute inset-0 rounded-md"
        style={{
          background: color,
          clipPath: config.bodyClip,
          boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)",
        }}
      />
      <div
        className="absolute"
        style={{
          ...config.flapPos,
          width: fold,
          height: fold,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 50%",
          transform: `rotate3d(${config.axis}, ${config.sign * angle}deg)`,
          transition: `transform ${duration}ms ease-in-out`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: color,
            clipPath: config.flapClip,
            backfaceVisibility: "hidden",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: underColor,
            clipPath: config.flapClip,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "inset 0 0 12px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      <div
        className="absolute pointer-events-none"
        style={{
          ...config.flapPos,
          width: fold,
          height: fold,
          background: "rgba(0,0,0,0.35)",
          clipPath: config.flapClip,
          filter: "blur(4px)",
          transform: `translate(${config.shadowDx}px, ${config.shadowDy}px)`,
          opacity: peel > 0.05 ? Math.min(1, peel * 1.5) : 0,
          transition: `opacity ${duration}ms ease-in-out`,
          zIndex: -1,
        }}
      />
    </div>
  );
}

interface PeelJsStyleProps {
  src: string;
  size?: number;
  fold: number;
  corner?: Corner;
  duration?: number;
  backDim?: number;
}

function PeelJsStyle({
  src,
  size = 180,
  fold,
  corner = "br",
  duration = 500,
  backDim = 0.85,
}: PeelJsStyleProps) {
  const p = fold * 0.55;
  const pct = p * 100;
  const k = size * (1 - p);
  const c = size * (2 - p);
  const kTl = size * p;

  const config = {
    br: {
      frontClip: `polygon(0 0, 100% 0, 100% ${100 - pct}%, ${100 - pct}% 100%, 0 100%)`,
      flapClip: `polygon(${100 - pct}% 100%, 100% ${100 - pct}%, ${100 - pct}% ${100 - pct}%)`,
      matrix: `matrix(0, -1, -1, 0, ${c}, ${c})`,
      shadowAngle: 135,
    },
    bl: {
      frontClip: `polygon(0 0, 100% 0, 100% 100%, ${pct}% 100%, 0 ${100 - pct}%)`,
      flapClip: `polygon(0 ${100 - pct}%, ${pct}% 100%, ${pct}% ${100 - pct}%)`,
      matrix: `matrix(0, 1, 1, 0, ${-k}, ${k})`,
      shadowAngle: 45,
    },
    tr: {
      frontClip: `polygon(0 0, ${100 - pct}% 0, 100% ${pct}%, 100% 100%, 0 100%)`,
      flapClip: `polygon(${100 - pct}% 0, 100% ${pct}%, ${100 - pct}% ${pct}%)`,
      matrix: `matrix(0, 1, 1, 0, ${k}, ${-k})`,
      shadowAngle: 225,
    },
    tl: {
      frontClip: `polygon(${pct}% 0, 100% 0, 100% 100%, 0 100%, 0 ${pct}%)`,
      flapClip: `polygon(${pct}% 0, 0 ${pct}%, ${pct}% ${pct}%)`,
      matrix: `matrix(0, -1, -1, 0, ${kTl}, ${kTl})`,
      shadowAngle: 315,
    },
  }[corner];

  const logoFill: React.CSSProperties = {
    backgroundImage: `url(${src})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  const maskStyle: React.CSSProperties = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskMode: "alpha",
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0"
        style={{
          ...logoFill,
          clipPath: config.frontClip,
          transition: `clip-path ${duration}ms ease-in-out`,
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.2))",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          ...maskStyle,
          clipPath: config.flapClip,
          transition: `clip-path ${duration}ms ease-in-out`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            ...logoFill,
            transform: config.matrix,
            transformOrigin: "0 0",
            filter: `brightness(${backDim}) saturate(0.7) contrast(0.95)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${config.shadowAngle}deg, rgba(0,0,0,0.45) 0%, transparent 45%)`,
            mixBlendMode: "multiply",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${config.shadowAngle}deg, transparent 55%, rgba(255,255,255,0.3) 100%)`,
            mixBlendMode: "screen",
          }}
        />
      </div>
    </div>
  );
}

interface DieCutPeelProps {
  src: string;
  size?: number;
  fold: number;
  corner?: Corner;
  color?: string;
  duration?: number;
  curlBase?: number;
}

function DieCutPeel({
  src,
  size = 180,
  fold,
  corner = "br",
  duration = 500,
  curlBase = 0.55,
}: DieCutPeelProps) {
  const cutSize = fold * size * curlBase;

  const bodyClip = {
    br: `polygon(0 0, 100% 0, 100% calc(100% - ${cutSize}px), calc(100% - ${cutSize}px) 100%, 0 100%)`,
    bl: `polygon(0 0, 100% 0, 100% 100%, ${cutSize}px 100%, 0 calc(100% - ${cutSize}px))`,
    tr: `polygon(0 0, calc(100% - ${cutSize}px) 0, 100% ${cutSize}px, 100% 100%, 0 100%)`,
    tl: `polygon(${cutSize}px 0, 100% 0, 100% 100%, 0 100%, 0 ${cutSize}px)`,
  }[corner];

  const curlPos: React.CSSProperties = {
    br: { bottom: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    tr: { top: 0, right: 0 },
    tl: { top: 0, left: 0 },
  }[corner];

  const curlGradient = {
    br: `linear-gradient(225deg, transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
    bl: `linear-gradient(135deg, transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
    tr: `linear-gradient(315deg, transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
    tl: `linear-gradient(45deg, transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
  }[corner];

  const curlShadow = {
    br: "-4px 4px 10px -2px rgba(0,0,0,0.45)",
    bl: "4px 4px 10px -2px rgba(0,0,0,0.45)",
    tr: "-4px -4px 10px -2px rgba(0,0,0,0.45)",
    tl: "4px -4px 10px -2px rgba(0,0,0,0.45)",
  }[corner];

  const maskStyle: React.CSSProperties = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          clipPath: bodyClip,
          transition: `clip-path ${duration}ms ease-in-out`,
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.2))",
        }}
      />
      <div className="absolute inset-0" style={maskStyle}>
        <div
          className="absolute"
          style={{
            ...curlPos,
            width: cutSize,
            height: cutSize,
            background: curlGradient,
            boxShadow: fold > 0.02 ? curlShadow : "none",
            transition: `width ${duration}ms ease-in-out, height ${duration}ms ease-in-out, box-shadow ${duration}ms ease-in-out`,
          }}
        />
      </div>
    </div>
  );
}

type Mode = "manual" | "hover" | "auto";

interface SwatchProps {
  title: string;
  subtitle: string;
  mode: Mode;
  peel: number;
  period?: number;
  children: (peel: number) => React.ReactNode;
}

function Swatch({ title, subtitle, mode, peel, period = 2400, children }: SwatchProps) {
  const [hovered, setHovered] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    if (mode !== "auto") return;
    const i = setInterval(() => setAutoOpen((o) => !o), period);
    return () => clearInterval(i);
  }, [mode, period]);

  const effectivePeel =
    mode === "manual"
      ? peel
      : mode === "hover"
        ? hovered
          ? peel
          : 0
        : autoOpen
          ? peel
          : 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-xl border border-charcoal/15 bg-background p-8",
          mode === "hover" && "cursor-pointer",
        )}
        onMouseEnter={mode === "hover" ? () => setHovered(true) : undefined}
        onMouseLeave={mode === "hover" ? () => setHovered(false) : undefined}
      >
        {children(effectivePeel)}
      </div>
      <div>
        <h3 className="text-sm uppercase tracking-widest">{title}</h3>
        <p className="mt-0.5 font-sans text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

const presetColors = [
  { key: "rose", value: "#ca6c84" },
  { key: "teal", value: "#375b6d" },
  { key: "orange", value: "#eca344" },
  { key: "olive", value: "#b1ad26" },
  { key: "rust", value: "#a2390a" },
  { key: "purple", value: "#6372af" },
];

const corners: { key: Corner; label: string }[] = [
  { key: "tl", label: "↖" },
  { key: "tr", label: "↗" },
  { key: "bl", label: "↙" },
  { key: "br", label: "↘" },
];

const peelAnglePresets = [
  { label: "↘", value: -45 },
  { label: "→", value: 0 },
  { label: "↗", value: 45 },
  { label: "↑", value: 90 },
  { label: "↖", value: 135 },
];

export default function StickerLabPage() {
  const [peel, setPeel] = useState(0.5);
  const [peelAngle, setPeelAngle] = useState(45);
  const [corner, setCorner] = useState<Corner>("br");
  const [color, setColor] = useState("#ca6c84");
  const [mode, setMode] = useState<Mode>("hover");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl uppercase tracking-wide">Sticker Lab</h1>
        <p className="font-sans text-sm text-muted-foreground">
          Peel techniques. Try the mode toggle — hover triggers per-swatch,
          auto cycles every ~2s, manual follows the slider.
        </p>
      </header>

      <div className="sticky top-2 z-20 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-charcoal/15 bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-1">
          <span className="font-sans text-xs uppercase tracking-wide">
            Mode
          </span>
          {(["hover", "auto", "manual"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-2 py-1 font-sans text-xs uppercase tracking-wide transition-colors",
                mode === m
                  ? "bg-charcoal text-cream"
                  : "bg-charcoal/10 text-charcoal hover:bg-charcoal/20",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide">
          Peel
          <input
            type="range"
            min={0}
            max={100}
            value={peel * 100}
            onChange={(e) => setPeel(Number(e.target.value) / 100)}
            className="w-28"
          />
          <span className="w-9 text-right tabular-nums">
            {Math.round(peel * 100)}%
          </span>
        </label>

        <label className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide">
          Angle
          <input
            type="range"
            min={-90}
            max={180}
            value={peelAngle}
            onChange={(e) => setPeelAngle(Number(e.target.value))}
            className="w-28"
          />
          <span className="w-10 text-right tabular-nums">{peelAngle}°</span>
          <span className="flex gap-0.5">
            {peelAnglePresets.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeelAngle(p.value)}
                className={cn(
                  "h-6 w-6 rounded font-sans text-xs leading-none transition-colors",
                  peelAngle === p.value
                    ? "bg-charcoal text-cream"
                    : "bg-charcoal/10 text-charcoal hover:bg-charcoal/20",
                )}
              >
                {p.label}
              </button>
            ))}
          </span>
        </label>

        <div className="flex items-center gap-1">
          <span className="font-sans text-xs uppercase tracking-wide">
            Corner
          </span>
          {corners.map((c) => (
            <button
              key={c.key}
              onClick={() => setCorner(c.key)}
              className={cn(
                "h-7 w-7 rounded font-sans text-sm leading-none transition-colors",
                corner === c.key
                  ? "bg-charcoal text-cream"
                  : "bg-charcoal/10 text-charcoal hover:bg-charcoal/20",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="font-sans text-xs uppercase tracking-wide">
            Color
          </span>
          {presetColors.map((c) => (
            <button
              key={c.key}
              onClick={() => setColor(c.value)}
              className={cn(
                "h-7 w-7 rounded border-2 transition-transform",
                color === c.value
                  ? "scale-110 border-charcoal"
                  : "border-transparent hover:scale-105",
              )}
              style={{ background: c.value }}
              aria-label={c.key}
            />
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          Slide Peel (bsehovac geometry)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="Slide Peel"
            subtitle="Diagonal peel via 2D translate + clip mask. Cream underside, drop shadow."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SlidePeel
                peel={p}
                peelAngle={peelAngle}
                color={color}
                borderRadius={8}
              />
            )}
          </Swatch>

          <Swatch
            title="Slide Peel — rounded"
            subtitle="Higher border radius. The math compensates for the radius offset."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SlidePeel
                peel={p}
                peelAngle={peelAngle}
                color={color}
                borderRadius={28}
              />
            )}
          </Swatch>

          <Swatch
            title="Slide Peel — flat back"
            subtitle="Solid underside, no curl shading. Reads more like folded paper."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SlidePeel
                peel={p}
                peelAngle={peelAngle}
                color={color}
                borderRadius={8}
                curlShading={false}
              />
            )}
          </Swatch>

          <Swatch
            title="Slide Peel — wide"
            subtitle="Non-square aspect. Useful for banner-shaped stickers."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SlidePeel
                width={240}
                height={140}
                peel={p}
                peelAngle={peelAngle}
                color={color}
                borderRadius={12}
              />
            )}
          </Swatch>

          <Swatch
            title="Slide Peel — with content"
            subtitle="Front face contains real content. Stays put as the corner peels."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SlidePeel
                peel={p}
                peelAngle={peelAngle}
                color={color}
                borderRadius={10}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl font-bold uppercase tracking-wider text-cream">
                    DCMC
                  </span>
                </div>
              </SlidePeel>
            )}
          </Swatch>

          <Swatch
            title="Slide Peel — slow"
            subtitle="1.2s easing. Easier to see what each layer is doing."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SlidePeel
                peel={p}
                peelAngle={peelAngle}
                color={color}
                borderRadius={8}
                duration={1200}
              />
            )}
          </Swatch>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          Gradient Curl (linkesch ramp)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="Gradient Curl"
            subtitle="Body clip-path + curl with transparent → grey ramp. Shadow offset away from fold."
            mode={mode}
            peel={peel}
          >
            {(p) => <GradientCurl curl={p} corner={corner} color={color} />}
          </Swatch>

          <Swatch
            title="Gradient Curl — small max"
            subtitle="Curl maxes at 30% of size. Restrained; corner-decoration feel."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <GradientCurl curl={p * 0.5} corner={corner} color={color} />
            )}
          </Swatch>

          <Swatch
            title="Gradient Curl — slow"
            subtitle="1.2s ease. The transparent zone of the gradient reveals the missing body triangle."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <GradientCurl
                curl={p}
                corner={corner}
                color={color}
                duration={1200}
              />
            )}
          </Swatch>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          Giraudel Fold (clip-path morph)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="Giraudel Fold"
            subtitle="Three layers (body / shadow / flap) animate via clip-path polygon morph. Pure CSS."
            mode={mode}
            peel={peel}
          >
            {(p) => <GiraudelFold fold={p} corner={corner} color={color} />}
          </Swatch>

          <Swatch
            title="Giraudel — slow"
            subtitle="1.2s ease lets you see each polygon morph independently."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <GiraudelFold
                fold={p}
                corner={corner}
                color={color}
                duration={1200}
              />
            )}
          </Swatch>

          <Swatch
            title="Giraudel — cream under"
            subtitle="Underside matches site cream. Reads as paper folding back."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <GiraudelFold
                fold={p}
                corner={corner}
                color={color}
                underColor="#efecdf"
              />
            )}
          </Swatch>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          SVG Path Curl (real bezier)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="SVG Path Curl"
            subtitle="Body uses quadratic-bezier cut; curl is a cubic-bezier petal with gradient + SVG drop-shadow."
            mode={mode}
            peel={peel}
          >
            {(p) => <SvgPathCurl fold={p} corner={corner} color={color} />}
          </Swatch>

          <Swatch
            title="SVG Path Curl — slow"
            subtitle="Smooth JS interpolation of the bezier control points."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SvgPathCurl
                fold={p}
                corner={corner}
                color={color}
                duration={1200}
              />
            )}
          </Swatch>

          <Swatch
            title="SVG Path Curl — small"
            subtitle="Capped to 50% of slider; subtle decoration."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <SvgPathCurl fold={p * 0.5} corner={corner} color={color} />
            )}
          </Swatch>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          Mirrored Flap (React Bits style)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="Mirrored Flap — top"
            subtitle="Body clips upward; mirrored duplicate slides down. The mirroring fakes the back-of-paper continuity."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <MirroredFlap peel={p} color={color} edge="top">
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl font-bold uppercase tracking-wider text-cream">
                    DCMC
                  </span>
                </div>
              </MirroredFlap>
            )}
          </Swatch>

          <Swatch
            title="Mirrored Flap — bottom"
            subtitle="Same trick, peeling up from the bottom edge."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <MirroredFlap peel={p} color={color} edge="bottom">
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl font-bold uppercase tracking-wider text-cream">
                    DCMC
                  </span>
                </div>
              </MirroredFlap>
            )}
          </Swatch>

          <Swatch
            title="Mirrored Flap — solid"
            subtitle="No content. Without text continuity, this looks more like a tab than a peel."
            mode={mode}
            peel={peel}
          >
            {(p) => <MirroredFlap peel={p} color={color} edge="top" />}
          </Swatch>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          Rotated Flap (true 3D, with caveats)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="Rotated Flap"
            subtitle="Real 3D rotation around the fold axis. Front/back faces with backface-visibility. Looks tilted, not curled."
            mode={mode}
            peel={peel}
          >
            {(p) => <RotatedFlap peel={p} corner={corner} color={color} />}
          </Swatch>

          <Swatch
            title="Rotated Flap — slow"
            subtitle="Watch the back face appear past 90°. Useful for understanding the geometry."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <RotatedFlap
                peel={p}
                corner={corner}
                color={color}
                duration={1200}
              />
            )}
          </Swatch>

          <Swatch
            title="Rotated Flap — high contrast"
            subtitle="White underside makes the back face pop when revealed."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <RotatedFlap
                peel={p}
                corner={corner}
                color={color}
                underColor="#ffffff"
              />
            )}
          </Swatch>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          Peel-js style (real shape-aware peel)
        </h2>
        <p className="mb-4 font-sans text-xs text-muted-foreground">
          The front is clipped to remove a triangular corner. The flap is a{" "}
          <em>mirrored</em> copy of the logo reflected across the fold line,
          then double-clipped: (a) to the flap triangle and (b) to the logo&apos;s
          own alpha silhouette. The flap&apos;s free edge curves with the logo
          outline — not the bounding box. Hinge stays straight.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="Peel-js — DCMC logo"
            subtitle="Mirrored logo on the flap, darkened and desaturated to read as 'back of sticker'."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <PeelJsStyle
                src="/images/dcmc-logo.png"
                fold={p}
                corner={corner}
              />
            )}
          </Swatch>

          <Swatch
            title="Peel-js — large"
            subtitle="220px. Bigger peel area makes the silhouette curvature obvious."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <PeelJsStyle
                src="/images/dcmc-logo.png"
                size={220}
                fold={p}
                corner={corner}
              />
            )}
          </Swatch>

          <Swatch
            title="Peel-js + outline"
            subtitle="Wrapped in DieCutSticker — the white outline filter redraws around the peeled silhouette each frame."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <DieCutSticker radius={4} elevation="l2">
                <PeelJsStyle
                  src="/images/dcmc-logo.png"
                  size={180}
                  fold={p}
                  corner={corner}
                />
              </DieCutSticker>
            )}
          </Swatch>

          <Swatch
            title="Peel-js — dark back"
            subtitle="More brightness attenuation on the flap. Reads as underside of a thicker sticker."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <PeelJsStyle
                src="/images/dcmc-logo.png"
                fold={p}
                corner={corner}
                backDim={0.55}
              />
            )}
          </Swatch>

          <Swatch
            title="Peel-js — audience image"
            subtitle="Same technique on the audience illustration. Any transparent PNG."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <PeelJsStyle
                src="/images/audience-white.png"
                size={220}
                fold={p}
                corner={corner}
              />
            )}
          </Swatch>

          <Swatch
            title="Peel-js — slow"
            subtitle="1.2s to inspect how the reflected logo slides through the flap region."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <PeelJsStyle
                src="/images/dcmc-logo.png"
                fold={p}
                corner={corner}
                duration={1200}
              />
            )}
          </Swatch>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          Die-Cut Peel (simple mask — earlier attempt for comparison)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch
            title="Simple mask peel"
            subtitle="Just a gradient curl masked to the logo silhouette. No mirrored back. Compare with peel-js above."
            mode={mode}
            peel={peel}
          >
            {(p) => (
              <DieCutPeel
                src="/images/dcmc-logo.png"
                fold={p}
                corner={corner}
              />
            )}
          </Swatch>
        </div>
      </section>

      <footer className="font-sans text-xs text-muted-foreground">
        Five technique families: <strong>Slide Peel</strong> (bsehovac
        translate+clip), <strong>Gradient Curl</strong> (linkesch transparent-to-grey
        ramp), <strong>Giraudel Fold</strong> (three-layer clip-path morph),
        <strong>SVG Path Curl</strong> (real cubic-bezier curve), and{" "}
        <strong>Rotated Flap</strong> (true 3D rotation). Slide and SVG read as
        actual peels; Giraudel reads as folded paper; Mirrored fakes back-of-paper
        text; Rotated reveals what flat-triangle 3D actually looks like (tilted,
        not curled).
      </footer>
    </div>
  );
}

"use client";

// Adapted from the Lexical playground's ColorPicker (v0.43.0), with brand
// swatches in place of its basic colors (see ColorPopover)

import { useId, useRef, useState } from "react";
import { calculateZoomLevel } from "@lexical/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  hexToRgb,
  hsvToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
  type Hsv,
} from "@/lib/color";
import { cn } from "@/lib/utils";

type PickerColor = { hex: string; hsv: Hsv };

function fromHex(hex: string): PickerColor {
  return { hex, hsv: rgbToHsv(hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }) };
}

function fromHsv(hsv: Hsv): PickerColor {
  return { hex: rgbToHex(hsvToRgb(hsv)), hsv };
}

// `color` is "" when the role isn't set
export function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (hex: string) => void;
}) {
  const hexId = useId();
  const [selfColor, setSelfColor] = useState(() => fromHex(color));
  const [inputColor, setInputColor] = useState(color);
  const [prevColor, setPrevColor] = useState(color);

  // Swatches, shades, Clear and the field's own hex input change the color
  // from outside. Hex that matches the picker came from it, so leave the hue
  // alone (a gray's hue isn't recoverable from its hex).
  if (color !== prevColor) {
    setPrevColor(color);
    if (!color) {
      setInputColor("");
    } else if (
      normalizeHex(color) &&
      normalizeHex(color) !== normalizeHex(selfColor.hex)
    ) {
      setSelfColor(fromHex(color));
      setInputColor(color);
    }
  }

  const pick = (next: PickerColor) => {
    setSelfColor(next);
    setInputColor(next.hex);
    onChange(next.hex);
  };

  const onSetHex = (hex: string) => {
    setInputColor(hex);
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      const next = fromHex(hex);
      setSelfColor(next);
      onChange(next.hex);
    }
  };

  const { h, s, v } = selfColor.hsv;

  return (
    <div className="flex flex-col gap-3">
      <MoveWrapper
        className="h-36 rounded-md bg-[linear-gradient(transparent,black),linear-gradient(to_right,white,transparent)]"
        style={{ backgroundColor: `hsl(${h}, 100%, 50%)` }}
        onChange={({ x, y }) => pick(fromHsv({ h, s: x * 100, v: 100 - y * 100 }))}
      >
        <div
          className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_15px_#00000026]"
          style={{
            backgroundColor: selfColor.hex,
            left: `${s}%`,
            top: `${100 - v}%`,
          }}
        />
      </MoveWrapper>
      <MoveWrapper
        className="h-3 rounded-full bg-[linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]"
        onChange={({ x }) => pick(fromHsv({ h: x * 360, s, v }))}
      >
        <div
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_0.5px_#0003]"
          style={{
            backgroundColor: `hsl(${h}, 100%, 50%)`,
            left: `${(h / 360) * 100}%`,
          }}
        />
      </MoveWrapper>
      <div className="flex items-center gap-2">
        <Label htmlFor={hexId} className="text-muted-foreground">
          Hex
        </Label>
        <Input
          id={hexId}
          value={inputColor}
          placeholder="Not set"
          spellCheck={false}
          className="font-mono"
          onChange={(e) => onSetHex(e.target.value.trim())}
        />
      </div>
    </div>
  );
}

type Position = { x: number; y: number };

// Reports the pointer's position over the area as fractions from 0 to 1.
// Pointer capture stands in for the playground's document mouse listeners,
// which also makes dragging work with touch.
function MoveWrapper({
  className,
  style,
  onChange,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  onChange: (position: Position) => void;
  children: React.ReactNode;
}) {
  const divRef = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const div = divRef.current;
    if (!div) return;
    const { width, height, left, top } = div.getBoundingClientRect();
    const zoom = calculateZoomLevel(div);
    onChange({
      x: clamp((e.clientX / zoom - left) / width),
      y: clamp((e.clientY / zoom - top) / height),
    });
  };

  return (
    <div
      ref={divRef}
      className={cn("relative w-full touch-none select-none", className)}
      style={style}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
      }}
    >
      {children}
    </div>
  );
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

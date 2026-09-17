"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SKETCH_NOISE, SKETCH_SCALE } from "@/components/SketchFilter";

const STROKE = 3;
// rounded-2xl
const RADIUS = 18;

// Browsers recompute an SVG filter over its whole area on every repaint, so a
// sketch filter across a tall card stalls scrolling on phones (iOS drops
// tiles). Displacing flat fill changes nothing, so only strips along the edges
// are filtered, each in its own short filter. The strips share one coordinate
// space, so the noise lines up across them and matches filtering the whole box.
const EDGE = 24;
const CHUNK = 240;
// How far the displaced outline can reach past the box
const BLEED = 4;
// Neighboring strips overlap, or hairline gaps show between them
const OVERLAP = 1;
// Source pixels the displacement can pull in from past a strip's edge
const MARGIN = 4;

type Rect = { x: number; y: number; width: number; height: number };

function grow({ x, y, width, height }: Rect, by: number): Rect {
  return { x: x - by, y: y - by, width: width + 2 * by, height: height + 2 * by };
}

function layout(width: number, height: number) {
  const right = Math.round(width) - EDGE;
  const bottom = Math.round(height) - EDGE;
  const whole = { x: 0, y: 0, width, height };
  if (right <= EDGE || bottom <= EDGE) {
    return { strips: [grow(whole, BLEED)], interior: null };
  }

  const strips: Rect[] = [
    { x: -BLEED, y: -BLEED, width: width + 2 * BLEED, height: EDGE + BLEED },
    { x: -BLEED, y: bottom, width: width + 2 * BLEED, height: height + BLEED - bottom },
  ];
  for (let y = EDGE; y < bottom; y += CHUNK) {
    const chunk = Math.min(CHUNK, bottom - y);
    strips.push(
      { x: -BLEED, y, width: EDGE + BLEED, height: chunk },
      { x: right, y, width: width + BLEED - right, height: chunk },
    );
  }
  return {
    strips: strips.map((strip) => grow(strip, OVERLAP)),
    interior: grow({ x: EDGE, y: EDGE, width: right - EDGE, height: bottom - EDGE }, OVERLAP),
  };
}

// The hand-drawn cream card surface, bordered in the page's edge color. Render
// it first inside a `relative` container; content after it needs `relative`
// to sit on top. `className` adds variants like hover stroke colors.
export function CardSurface({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  // Measured before paint so client navigations never draw the fallback.
  // Computed style gives the fractional layout size, unaffected by transforms
  // like a tile's hover tilt.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (width: number, height: number) =>
      setSize((prev) =>
        prev?.width === width && prev.height === height ? prev : { width, height },
      );
    const style = getComputedStyle(el);
    update(parseFloat(style.width), parseFloat(style.height));
    const observer = new ResizeObserver(([entry]) =>
      update(entry.contentRect.width, entry.contentRect.height),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "absolute inset-0 rounded-2xl fill-cream stroke-page-edge shadow-xl transition-colors",
        className,
      )}
    >
      {/* Server render until hydrated: a CSS-filtered box that looks the same */}
      {size ? (
        <SketchedBox id={id} {...size} />
      ) : (
        <div className="absolute inset-0 rounded-2xl border-[3px] border-page-edge bg-cream sketch" />
      )}
    </div>
  );
}

function SketchedBox({ id, width, height }: { id: string; width: number; height: number }) {
  const { strips, interior } = layout(width, height);
  const outline = {
    x: STROKE / 2,
    y: STROKE / 2,
    width: width - STROKE,
    height: height - STROKE,
    rx: RADIUS - STROKE / 2,
    strokeWidth: STROKE,
  };

  return (
    <svg className="absolute inset-0 overflow-visible" width={width} height={height}>
      <defs>
        {strips.map((strip, i) => (
          <filter
            key={i}
            id={`${id}-${i}`}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            {...grow(strip, MARGIN)}
          >
            <feTurbulence {...strip} type="turbulence" {...SKETCH_NOISE} result="noise" />
            <feDisplacementMap
              {...strip}
              in="SourceGraphic"
              in2="noise"
              scale={SKETCH_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        ))}
      </defs>
      {strips.map((_, i) => (
        <rect key={i} {...outline} filter={`url(#${id}-${i})`} />
      ))}
      {interior && <rect {...interior} stroke="none" />}
    </svg>
  );
}

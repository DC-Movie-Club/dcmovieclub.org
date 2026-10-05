"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { INK, SKETCH_NOISE, SKETCH_SCALE } from "@/components/SketchFilter";

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
// How far the ink line's blur and spread read past a strip's edge. Its wobble
// is drawn this much wider and the finished line cropped back to the strip,
// or the pressure cut would see the strip's edge and notch the line at seams.
const INK_PAD = 3;

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
    // Inside a display: none ancestor (like a hidden admin preview) the size
    // is "auto"; the observer measures it once it shows
    const style = getComputedStyle(el);
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);
    if (Number.isFinite(width) && Number.isFinite(height)) update(width, height);
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
        <>
          <div className="absolute inset-px rounded-2xl bg-cream sketch" />
          <div className="absolute inset-0 rounded-2xl border-[3px] border-page-edge ink" />
        </>
      )}
    </div>
  );
}

// The ink line only suits one color on a clear ground, so each strip is drawn
// twice: the fill under the plain wobble, then the line in ink over it. Both
// take the same displacement, so the fill's edge stays under the line.
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
          <StripFilters key={i} id={`${id}-${i}`} strip={strip} />
        ))}
      </defs>
      {strips.map((_, i) => (
        <rect key={i} {...outline} stroke="none" filter={`url(#${id}-${i}-fill)`} />
      ))}
      {interior && <rect {...interior} stroke="none" />}
      {strips.map((_, i) => (
        <rect key={i} {...outline} fill="none" filter={`url(#${id}-${i}-line)`} />
      ))}
    </svg>
  );
}

function Wobble({ area, result }: { area: Rect; result?: string }) {
  return (
    <>
      <feTurbulence {...area} type="turbulence" {...SKETCH_NOISE} result="noise" />
      <feDisplacementMap
        {...area}
        in="SourceGraphic"
        in2="noise"
        scale={SKETCH_SCALE}
        xChannelSelector="R"
        yChannelSelector="G"
        result={result}
      />
    </>
  );
}

// A strip's fill filter (the sketch wobble) and line filter (the ink filter's
// steps, as in SketchFilter)
function StripFilters({ id, strip }: { id: string; strip: Rect }) {
  const wide = grow(strip, INK_PAD);

  return (
    <>
      <filter
        id={`${id}-fill`}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        {...grow(strip, MARGIN)}
      >
        <Wobble area={strip} />
      </filter>
      <filter
        id={`${id}-line`}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        {...grow(wide, MARGIN)}
      >
        <Wobble area={wide} result="wobbled" />
        <feGaussianBlur {...wide} in="wobbled" stdDeviation={INK.blur} result="blurred" />
        <feTurbulence {...strip} type="fractalNoise" {...INK.pressure} result="pressure" />
        <feComposite
          {...strip}
          in="blurred"
          in2="pressure"
          operator="arithmetic"
          {...INK.cut}
          result="stroke"
        />
        <feMorphology {...wide} in="wobbled" operator="dilate" radius={INK.spread} result="ink" />
        <feComposite {...strip} in="ink" in2="stroke" operator="in" />
      </filter>
    </>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SketchFilter } from "@/components/SketchFilter";
import { cn } from "@/lib/utils";

// Space left above an element scrolled to
const SCROLL_MARGIN = 16;

// Renders public-site content at a desktop `width`, zoomed down to fit and
// scrolling inside its box. Dropdowns and hovers work; links don't navigate.
// `scrollTo` is a selector inside the content to bring into view, or null for
// the top.
export function PreviewFrame({
  width,
  scrollTo,
  className,
  children,
}: {
  width: number;
  scrollTo: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<{ zoom: number; height: number } | null>(
    null,
  );
  const measured = frame !== null;

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // A hidden frame measures 0 wide; keep the last size until it shows
    const measure = (box: { width: number; height: number }) => {
      if (box.width === 0) return;
      const zoom = box.width / width;
      setFrame({ zoom, height: box.height / zoom });
    };
    measure({ width: el.clientWidth, height: el.clientHeight });
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect));
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const box = frameRef.current;
    const content = contentRef.current;
    if (!box || !content || !measured) return;
    const target = scrollTo ? content.querySelector(scrollTo) : null;
    // A section with nothing in it isn't on the page, so stay put
    if (scrollTo && !target) return;
    const top = target
      ? target.getBoundingClientRect().top -
        box.getBoundingClientRect().top +
        box.scrollTop -
        SCROLL_MARGIN
      : 0;
    box.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [scrollTo, measured]);

  return (
    <div
      ref={frameRef}
      className={cn("overflow-x-hidden overflow-y-auto", className)}
    >
      <div
        ref={contentRef}
        data-preview
        className={cn(
          "bg-background font-dcmc text-foreground antialiased",
          !measured && "invisible",
        )}
        style={
          {
            width,
            zoom: frame?.zoom ?? 1,
            "--preview-height": frame ? `${frame.height}px` : undefined,
          } as React.CSSProperties
        }
        onClickCapture={(e) => {
          if ((e.target as Element).closest("a")) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <SketchFilter />
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { withExternalLinks } from "@/lib/external-links";
import { cn } from "@/lib/utils";

interface ExpandableDescriptionProps {
  html: string;
  threshold?: number;
  className?: string;
  htmlClassName?: string;
  collapsedClassName?: string;
  actionClassName?: string;
  // Shown after the HTML, so it's only reached once expanded
  children?: React.ReactNode;
}

export function ExpandableDescription({
  html,
  threshold = 220,
  className,
  htmlClassName,
  collapsedClassName = "max-h-[4lh]",
  actionClassName,
  children,
}: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  // Seeded from text length so the server render is close; corrected by
  // measuring once the real line wrapping is known.
  const [overflowing, setOverflowing] = useState(
    () => html.replace(/<[^>]*>/g, "").length > threshold,
  );
  // While newly opened text fades in: where the collapsed text began fading
  // out, in px
  const [revealFrom, setRevealFrom] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const safeHtml = useMemo(() => withExternalLinks(html), [html]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content || expanded) return;
    const observer = new ResizeObserver(() => {
      setOverflowing(content.offsetHeight > wrapper.clientHeight + 1);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [expanded]);

  // The text opens to full height in one frame and the new lines fade in
  // after. Growing it over time made the card around it redraw its
  // hand-drawn edges every frame, which phones couldn't keep up with.
  function toggle() {
    const wrapper = wrapperRef.current;
    const toggleTop = toggleRef.current?.getBoundingClientRect().top;
    flushSync(() => {
      setRevealFrom(!expanded && wrapper ? wrapper.clientHeight / 2 : null);
      setExpanded(!expanded);
    });
    // Collapsing shrinks the page above a reader deep in a long text, so it
    // scrolls to keep this button where it was on screen
    const toggleNow = toggleRef.current?.getBoundingClientRect().top;
    if (expanded && toggleTop !== undefined && toggleNow !== undefined) {
      window.scrollBy({ top: toggleNow - toggleTop, behavior: "instant" });
    }
  }

  const showToggle = overflowing || expanded;
  const ToggleIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <div className={className}>
      <div
        ref={wrapperRef}
        className={cn(
          "overflow-hidden",
          !expanded && collapsedClassName,
          showToggle && !expanded && "mask-b-from-50%",
          revealFrom !== null && "animate-reveal motion-reduce:animate-none",
        )}
        style={
          revealFrom !== null
            ? ({ "--reveal-from": `${revealFrom}px` } as React.CSSProperties)
            : undefined
        }
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setRevealFrom(null);
        }}
      >
        <div ref={contentRef}>
          <div
            className={htmlClassName}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
          {children}
        </div>
      </div>
      {showToggle && (
        <button
          ref={toggleRef}
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          className={cn(
            "group/toggle relative mx-auto mt-2 flex rounded-full text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust",
            actionClassName,
          )}
        >
          <span
            aria-hidden
            className="absolute inset-px rounded-full bg-cream shadow-md sketch-subtle group-hover/toggle:boil"
          />
          {/* Faded with opacity, since the ink filter cuts away a
              translucent line */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-charcoal opacity-25 ink-subtle group-hover/toggle:opacity-40 group-hover/toggle:boil"
          />
          <span className="relative flex items-center gap-1 px-4 py-1.5 text-xs uppercase tracking-wider">
            {expanded ? "Show less" : "Read more"}
            <ToggleIcon size={14} />
          </span>
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableDescriptionProps {
  html: string;
  threshold?: number;
  className?: string;
  actionClassName?: string;
}

function withExternalLinks(html: string) {
  return html.replace(/<a\b([^>]*)>/gi, (_match, attrs: string) => {
    const hasTarget = /\btarget\s*=/.test(attrs);
    const hasRel = /\brel\s*=/.test(attrs);
    let out = `<a${attrs}`;
    if (!hasTarget) out += ' target="_blank"';
    if (!hasRel) out += ' rel="noopener noreferrer"';
    out += ">";
    return out;
  });
}

export function ExpandableDescription({
  html,
  threshold = 220,
  className,
  actionClassName,
}: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  // Seeded from text length so the server render is close; corrected by
  // measuring once the real line wrapping is known.
  const [overflowing, setOverflowing] = useState(
    () => html.replace(/<[^>]*>/g, "").length > threshold,
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const collapsedHeight = useRef(0);
  const safeHtml = useMemo(() => withExternalLinks(html), [html]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content || !collapsed) return;
    const observer = new ResizeObserver(() => {
      setOverflowing(content.offsetHeight > wrapper.clientHeight + 1);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [collapsed]);

  // Height is driven imperatively: pin the current pixel height, change the
  // content, then set the target height so the CSS transition has two concrete
  // values to interpolate between. Height returns to auto once it settles.
  function settle(collapsing: boolean) {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (collapsing) setCollapsed(true);
    wrapper.style.height = "";
  }

  // With reduced motion there is no transition, so transitionend never fires.
  function settleIfNotAnimating(collapsing: boolean) {
    if (wrapperRef.current?.getAnimations().length === 0) settle(collapsing);
  }

  function toggle() {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    if (!expanded) {
      collapsedHeight.current = wrapper.offsetHeight;
      wrapper.style.height = `${collapsedHeight.current}px`;
      flushSync(() => {
        setCollapsed(false);
        setExpanded(true);
      });
      wrapper.style.height = `${content.offsetHeight}px`;
    } else {
      wrapper.style.height = `${wrapper.offsetHeight}px`;
      void wrapper.offsetHeight;
      wrapper.style.height = `${collapsedHeight.current}px`;
      setExpanded(false);
    }
    settleIfNotAnimating(expanded);
  }

  const showToggle = overflowing || expanded;
  const ToggleIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <div className={className}>
      <div
        ref={wrapperRef}
        className={cn(
          "overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none",
          collapsed && "max-h-[4lh]",
          showToggle && !expanded && "mask-b-from-50%",
        )}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "height") {
            settle(!expanded);
          }
        }}
      >
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </div>
      {showToggle && (
        <button
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
            className="absolute inset-0 rounded-full border-2 border-charcoal/25 bg-cream shadow-md sketch-subtle group-hover/toggle:border-charcoal/40 group-hover/toggle:sketch-subtle-animated"
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

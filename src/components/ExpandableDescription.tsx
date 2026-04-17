"use client";

import { useMemo, useState } from "react";
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
  const safeHtml = useMemo(() => withExternalLinks(html), [html]);
  const plainText = html.replace(/<[^>]*>/g, "");
  const needsExpand = plainText.length > threshold;

  return (
    <div className={className}>
      <div
        className={cn(!expanded && needsExpand && "line-clamp-3")}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      {needsExpand && (
        <div
          className={cn(
            "mt-1 flex",
            expanded ? "justify-start" : "justify-end",
          )}
        >
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "rounded-sm text-xs uppercase tracking-wider hover:underline hover:sketch-subtle-animated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream",
              actionClassName,
            )}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
}

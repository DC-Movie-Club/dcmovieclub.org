"use client";

import { useDeferredValue } from "react";
import { PreviewFrame } from "@/app/admin/components/PreviewFrame";
import { PageBody, type PageData } from "@/components/pages/PageBody";
import type { PageView } from "@/lib/pages";

// Wide enough for the desktop layout, narrow enough to stay legible
const DESKTOP_WIDTH = 800;

// Sections render with their key as their id; the page title is its only h1
function selectorFor(page: PageView, item: string) {
  if (item === "title") return "h1";
  return page.sections.some((s) => s.key === item) ? `#${item}` : null;
}

// Outlines the part being edited
function highlightCss(selector: string | null) {
  return selector
    ? `[data-preview] ${selector} { border-radius: 0.75rem; outline: 3px solid var(--color-ring); outline-offset: 10px; }`
    : "";
}

// The page as it will look with the draft, built by the same component as the
// public route, with live events, posts and reviews. It scrolls to and outlines
// the part being edited.
export function PagePreview({
  page,
  data,
  selected,
  className,
}: {
  page: PageView;
  data: PageData;
  selected: string;
  className?: string;
}) {
  const deferred = useDeferredValue(page);
  const selector = selectorFor(deferred, selected);
  return (
    <PreviewFrame
      width={DESKTOP_WIDTH}
      scrollTo={selector}
      className={className}
    >
      <style>{highlightCss(selector)}</style>
      <PageBody page={deferred} data={data} />
    </PreviewFrame>
  );
}

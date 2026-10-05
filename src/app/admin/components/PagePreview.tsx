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

function sectionSelectors(page: PageView) {
  return page.sections.map((s) => `#${s.key}`);
}

function itemAt(page: PageView, target: Element) {
  if (target.closest("h1")) return "title";
  const selectors = sectionSelectors(page);
  return selectors.length > 0
    ? (target.closest(selectors.join(", "))?.id ?? null)
    : null;
}

function highlightCss(page: PageView, selected: string) {
  const pickable = ["h1", ...sectionSelectors(page)].join(", ");
  const current = selectorFor(page, selected);
  return `
    [data-preview] :is(${pickable}) {
      cursor: pointer;
      border-radius: 0.75rem;
      outline: 3px dashed transparent;
      outline-offset: 10px;
      transition: outline-color 150ms;
    }
    [data-preview] :is(${pickable}):hover {
      outline-color: color-mix(in srgb, var(--color-ring) 55%, transparent);
    }
    ${current ? `[data-preview] ${current} { outline: 3px solid var(--color-ring); }` : ""}
  `;
}

// The page as it will look with the draft, built by the same component as the
// public route, with live events, posts and reviews. Clicking a part of the
// page selects it for editing.
export function PagePreview({
  page,
  data,
  selected,
  onSelect,
  className,
}: {
  page: PageView;
  data: PageData;
  selected: string;
  onSelect: (item: string) => void;
  className?: string;
}) {
  const deferred = useDeferredValue(page);
  return (
    <PreviewFrame
      width={DESKTOP_WIDTH}
      scrollTo={selectorFor(deferred, selected)}
      className={className}
      onClickContent={(target) => {
        const item = itemAt(deferred, target);
        if (item) onSelect(item);
      }}
    >
      <style>{highlightCss(deferred, selected)}</style>
      <PageBody page={deferred} data={data} />
    </PreviewFrame>
  );
}

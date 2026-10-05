"use client";

import { useEffect, useRef, useState } from "react";

// While `active`, a click on a link to another admin page is held back and its
// destination returned as `pending`, so the editor can ask before leaving.
// Links inside the page preview are left alone; the preview disables them.
export function useLeaveGuard(active: boolean) {
  const [pending, setPending] = useState<string | null>(null);
  const latest = useRef(active);
  useEffect(() => {
    latest.current = active;
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!latest.current || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === "_blank" || link.closest("[data-preview]")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) {
        return;
      }
      // Capturing on the document runs before React's handlers, so the
      // router never sees the click
      e.preventDefault();
      e.stopPropagation();
      setPending(url.pathname + url.search);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return { pending, cancel: () => setPending(null) };
}

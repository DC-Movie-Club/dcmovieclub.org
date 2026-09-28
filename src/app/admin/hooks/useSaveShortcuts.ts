"use client";

import { useEffect, useRef } from "react";

// Cmd/Ctrl-S saves, and leaving the page with unsaved changes asks first
export function useSaveShortcuts(canSave: boolean, save: () => void) {
  const latest = useRef({ canSave, save });
  useEffect(() => {
    latest.current = { canSave, save };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (latest.current.canSave) latest.current.save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!canSave) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [canSave]);
}

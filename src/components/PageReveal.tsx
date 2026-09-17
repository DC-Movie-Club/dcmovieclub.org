"use client";

import { useEffect } from "react";

function loaded(img: HTMLImageElement) {
  if (img.complete) return Promise.resolve();
  return new Promise<void>((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

function onScreen(el: Element) {
  const { top, bottom, width } = el.getBoundingClientRect();
  return width > 0 && bottom > 0 && top < window.innerHeight;
}

function onScreenMaskImages() {
  const urls = new Set<string>();
  for (const el of document.querySelectorAll<HTMLElement>("[style*='mask-image']")) {
    const match = /url\(["']?([^"')]+)/.exec(el.style.maskImage || el.style.webkitMaskImage);
    if (match && onScreen(el)) urls.add(match[1]);
  }
  return [...urls].map((src) => {
    const img = new Image();
    img.src = src;
    return loaded(img);
  });
}

// The root layout's inline script marks the document as loading, which holds
// the page fade-in and nav entrance on their first frame (see globals.css).
// This lets them play once hydration is done and the fonts and on-screen
// images and mask artwork are in, so the page appears fully laid out.
export function PageReveal() {
  useEffect(() => {
    // The nav starts offscreen for its entrance, so its logo is counted directly
    const images = [...document.images]
      .filter((img) => onScreen(img) || img.closest("nav"))
      .map(loaded);
    Promise.all([document.fonts.ready, ...images, ...onScreenMaskImages()]).then(() => {
      delete document.documentElement.dataset.loading;
    });
  }, []);

  return null;
}

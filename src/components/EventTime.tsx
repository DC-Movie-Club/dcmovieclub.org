"use client";

import { useSyncExternalStore } from "react";
import { formatTime } from "@/lib/event-format";

const subscribe = () => () => {};

export function EventTime({ start, end }: { start: string; end?: string }) {
  // The server can't know the viewer's zone, so it renders without the suffix
  // and the client adds "ET" after hydration when local time would differ.
  const isViewerOnEastern = useSyncExternalStore(
    subscribe,
    () =>
      formatTime(start) ===
      formatTime(start, Intl.DateTimeFormat().resolvedOptions().timeZone),
    () => true,
  );

  const time = end
    ? `${formatTime(start)} – ${formatTime(end)}`
    : formatTime(start);

  return (
    <>
      {time}
      {!isViewerOnEastern && " ET"}
    </>
  );
}

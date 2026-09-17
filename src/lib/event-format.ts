import type { CalendarEvent } from "@/types/event"

const TIME_ZONE = "America/New_York"

export function formatEventDate(event: CalendarEvent) {
  const date = new Date(event.start)
  // All-day starts are bare dates ("2026-10-06") that parse as UTC midnight,
  // so formatting them in Eastern time would roll back to the previous day.
  const timeZone = event.allDay ? "UTC" : TIME_ZONE
  return {
    month: date.toLocaleDateString("en-US", { month: "short", timeZone }),
    day: date.toLocaleDateString("en-US", { day: "numeric", timeZone }),
    weekday: date.toLocaleDateString("en-US", { weekday: "long", timeZone }),
  }
}

export function formatTime(iso: string, timeZone = TIME_ZONE) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  })
}

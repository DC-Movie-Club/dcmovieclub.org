import type { CalendarEvent } from "@/types/event"

export const TIME_ZONE = "America/New_York"

// All-day starts are bare dates ("2026-10-06") that parse as UTC midnight,
// so formatting them in Eastern time would roll back to the previous day.
function dateTimeZone(event: CalendarEvent) {
  return event.allDay ? "UTC" : TIME_ZONE
}

export function formatEventDate(event: CalendarEvent) {
  const date = new Date(event.start)
  const timeZone = dateTimeZone(event)
  return {
    month: date.toLocaleDateString("en-US", { month: "short", timeZone }),
    day: date.toLocaleDateString("en-US", { day: "numeric", timeZone }),
    weekday: date.toLocaleDateString("en-US", { weekday: "long", timeZone }),
  }
}

// "October", or "January 2027" once the event falls outside the current year.
export function formatEventMonth(event: CalendarEvent, now = new Date()) {
  const date = new Date(event.start)
  const timeZone = dateTimeZone(event)
  const month = date.toLocaleDateString("en-US", { month: "long", timeZone })
  const year = date.toLocaleDateString("en-US", { year: "numeric", timeZone })
  const currentYear = now.toLocaleDateString("en-US", {
    year: "numeric",
    timeZone: TIME_ZONE,
  })
  return year === currentYear ? month : `${month} ${year}`
}

export function formatTime(iso: string, timeZone = TIME_ZONE) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  })
}

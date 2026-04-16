import type { CalendarEvent } from "@/types/event"
import type { SubstackPost } from "@/types/post"

const CALENDAR_ID =
  "5a3c273aeca64dfd79ebc3784f4249046a77febbc71d5281e4a92a71c2f5c5c8@group.calendar.google.com"

type GoogleCalendarEvent = {
  id: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

type GoogleCalendarResponse = {
  items?: GoogleCalendarEvent[]
}

const TICKET_TAILOR_RE = /https?:\/\/(?:(?:www\.|app\.)?tickettailor\.com|buytickets\.at)\/[^\s<"']*/i

function extractTicketUrl(description?: string): string | null {
  if (!description) return null
  const match = description.match(TICKET_TAILOR_RE)
  return match ? match[0] : null
}

export async function getUpcomingEvents(): Promise<CalendarEvent[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
  if (!apiKey) return []

  const params = new URLSearchParams({
    key: apiKey,
    timeMin: new Date().toISOString(),
    maxResults: "10",
    singleEvents: "true",
    orderBy: "startTime",
  })

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []

    const data: GoogleCalendarResponse = await res.json()
    if (!data.items) return []

    return data.items.map((item) => ({
      id: item.id,
      title: item.summary ?? "Untitled Event",
      description: item.description ?? null,
      location: item.location ?? null,
      start: item.start.dateTime ?? item.start.date ?? "",
      end: item.end.dateTime ?? item.end.date ?? "",
      allDay: !item.start.dateTime,
      link: item.htmlLink ?? null,
      ticketUrl: extractTicketUrl(item.description),
    }))
  } catch {
    return []
  }
}

const SUBSTACK_FEED_URL = "https://dcmovieclub.substack.com/feed"

export async function getRecentPosts(limit = 10): Promise<SubstackPost[]> {
  try {
    const res = await fetch(SUBSTACK_FEED_URL, { next: { revalidate: 3600 } })
    if (!res.ok) return []

    const xml = await res.text()
    const Parser = (await import("rss-parser")).default
    const parser = new Parser()
    const feed = await parser.parseString(xml)

    return (feed.items ?? []).slice(0, limit).map((item) => ({
      title: item.title ?? "Untitled",
      link: item.link ?? "",
      description: item.contentSnippet ?? null,
      pubDate: item.pubDate ?? "",
      imageUrl: item.enclosure?.url ?? null,
    }))
  } catch {
    return []
  }
}

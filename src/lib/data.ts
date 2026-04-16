import type { CalendarEvent } from "@/types/event"
import type { LetterboxdReview } from "@/types/letterboxd"
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

// TODO: use Ticket Tailor API (TICKET_TAILOR_API_KEY) to fetch event images (images.header / images.thumbnail) for events with a TT link
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

const DC_MOVIE_CLUB_LETTERBOXD_MEMBER_ID = "fE0Qx"

type LetterboxdTokenResponse = {
  access_token: string
  expires_in: number
}

type LetterboxdLogEntry = {
  id: string
  film: {
    id: string
    name: string
    releaseYear?: number
    poster?: { sizes?: { width: number; height: number; url: string }[] }
    links?: { type: string; id: string; url: string }[]
  }
  links?: { type: string; id: string; url: string }[]
  like: boolean
  diaryDetails?: { diaryDate: string; rewatch: boolean }
  review?: { text: string }
  rating?: number
  whenCreated: string
}

type LetterboxdLogResponse = {
  items?: LetterboxdLogEntry[]
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getLetterboxdAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 1000) {
    return cachedToken.value
  }

  const clientId = process.env.LETTERBOXD_CLIENT_ID
  const clientSecret = process.env.LETTERBOXD_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  try {
    const res = await fetch("https://api.letterboxd.com/api/v0/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    if (!res.ok) return null
    const data: LetterboxdTokenResponse = await res.json()
    cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
    return data.access_token
  } catch {
    return null
  }
}

export async function getRecentLetterboxdReviews(
  limit = 20,
): Promise<LetterboxdReview[]> {
  const token = await getLetterboxdAccessToken()
  if (!token) return []

  try {
    const params = new URLSearchParams({
      member: DC_MOVIE_CLUB_LETTERBOXD_MEMBER_ID,
      perPage: String(limit),
    })
    const res = await fetch(
      `https://api.letterboxd.com/api/v0/log-entries?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      },
    )
    if (!res.ok) return []

    const data: LetterboxdLogResponse = await res.json()
    if (!data.items) return []

    return data.items.map((entry) => {
      const poster =
        entry.film.poster?.sizes?.find((s) => s.width >= 150) ??
        entry.film.poster?.sizes?.[0]
      return {
        id: entry.id,
        filmTitle: entry.film.name,
        filmYear: entry.film.releaseYear ?? null,
        posterUrl: poster?.url ?? null,
        rating: entry.rating ?? null,
        liked: entry.like,
        review: entry.review?.text ?? null,
        diaryDate: entry.diaryDetails?.diaryDate ?? null,
        url: entry.links?.find((l) => l.type === "letterboxd")?.url
          ?? `https://letterboxd.com/DCMovieClub/film/${entry.film.id}/`,
      }
    })
  } catch {
    return []
  }
}

function toTinyUrl(url: string): string {
  const match = url.match(/^(https:\/\/substackcdn\.com\/image\/fetch\/)[^/]+(\/.+)$/)
  return match ? `${match[1]}w_24,q_20,f_webp${match[2]}` : url
}

const blurCache = new Map<string, string | null>()

async function generateBlurDataUrl(
  imageUrl: string,
): Promise<string | null> {
  const cached = blurCache.get(imageUrl)
  if (cached !== undefined) return cached

  try {
    const res = await fetch(toTinyUrl(imageUrl))
    if (!res.ok) {
      blurCache.set(imageUrl, null)
      return null
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const dataUrl = `data:image/webp;base64,${buffer.toString("base64")}`
    blurCache.set(imageUrl, dataUrl)
    return dataUrl
  } catch {
    blurCache.set(imageUrl, null)
    return null
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

    const items = (feed.items ?? []).slice(0, limit)

    return Promise.all(
      items.map(async (item) => ({
        title: item.title ?? "Untitled",
        link: item.link ?? "",
        description: item.contentSnippet ?? null,
        pubDate: item.pubDate ?? "",
        imageUrl: item.enclosure?.url ?? null,
        blurDataUrl: item.enclosure?.url
          ? await generateBlurDataUrl(item.enclosure.url)
          : null,
      })),
    )
  } catch {
    return []
  }
}

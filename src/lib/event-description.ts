import type { EventTicket } from "@/types/event"
import { decodeEntities } from "./link-preview.ts"

// TODO: use Ticket Tailor API (TICKET_TAILOR_API_KEY) to fetch event images (images.header / images.thumbnail) for events with a TT link
// Punctuation after a bare URL ends the sentence, not the URL
const TICKET_TAILOR_RE = /https?:\/\/(?:(?:www\.|app\.)?tickettailor\.com|buytickets\.at)\/[^\s<"']*[^\s<"'.,;:!?)]/i

const ANCHOR_RE = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
const CTA_TEXT_RE = /ticket|register|reserve|rsvp|sign up|buy/i

// Organizers reserve tentative dates with "HOLD: ..." placeholders that shouldn't go public.
const HOLD_RE = /^\s*hold:/i

export function isHoldEvent(title?: string) {
  return HOLD_RE.test(title ?? "")
}

// Organizers link tickets from many hosts (Ticket Tailor, Google Forms, venue
// sites), so the anchor text is a more reliable signal than the URL itself.
// An event can link several, e.g. one per film when there's a choice.
export function extractTickets(description?: string): {
  tickets: EventTicket[]
  description: string | null
} {
  if (!description) return { tickets: [], description: null }
  const tickets: EventTicket[] = []
  for (const [, href, html] of description.matchAll(ANCHOR_RE)) {
    const text = decodeEntities(html.replace(/<[^>]*>/g, "")).trim()
    const url = href.replace(/&amp;/g, "&")
    if (CTA_TEXT_RE.test(text) && !tickets.some((t) => t.url === url)) {
      tickets.push({ label: ticketLabel(text), url })
    }
  }
  const match = !tickets.length && description.match(TICKET_TAILOR_RE)
  if (match) tickets.push({ label: "Tickets", url: match[0].replace(/&amp;/g, "&") })
  return { tickets, description: tidyDescription(description) }
}

const TICKET_WORD_RE = /^tickets?\b[\s:!.-]*|[\s:!.-]*\btickets?[\s:!.]*$/gi
const BARE_VERB_RE = /^(?:get|buy|book|reserve)?$/i

// "VERITY TICKETS" reads "VERITY" next to its siblings; text with nothing
// else to it ("Buy tickets!") stays whole.
function ticketLabel(text: string) {
  const label = text.replace(TICKET_WORD_RE, "")
  return BARE_VERB_RE.test(label) ? text : label
}

const EMPTY_INLINE_RE = /<(b|strong|u|em|i)>((?:\s|<br\s*\/?>)*)<\/\1>/gi
const EDGE_BREAKS_RE =
  /^(?:\s|<br\s*\/?>|<p>(?:\s|<br\s*\/?>)*<\/p>)+|(?:\s|<br\s*\/?>|<p>(?:\s|<br\s*\/?>)*<\/p>)+$/gi
const REPEATED_BREAKS_RE = /(?:<br\s*\/?>\s*){3,}/gi

export function tidyDescription(html: string): string | null {
  let out = html
  let previous
  do {
    previous = out
    out = out.replace(EMPTY_INLINE_RE, "$2")
  } while (out !== previous)
  out = out.replace(EDGE_BREAKS_RE, "").replace(REPEATED_BREAKS_RE, "<br><br>")
  return out || null
}

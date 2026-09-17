// TODO: use Ticket Tailor API (TICKET_TAILOR_API_KEY) to fetch event images (images.header / images.thumbnail) for events with a TT link
const TICKET_TAILOR_RE = /https?:\/\/(?:(?:www\.|app\.)?tickettailor\.com|buytickets\.at)\/[^\s<"']*/i

const ANCHOR_RE = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
const CTA_TEXT_RE = /ticket|register|reserve|rsvp|sign up|buy/i

// Organizers reserve tentative dates with "HOLD: ..." placeholders that shouldn't go public.
const HOLD_RE = /^\s*hold:/i

export function isHoldEvent(title?: string) {
  return HOLD_RE.test(title ?? "")
}

// Organizers link tickets from many hosts (Ticket Tailor, Google Forms, venue
// sites), so the anchor text is a more reliable signal than the URL itself.
// The matched link is removed from the description since it's surfaced as the CTA.
export function extractTicket(description?: string): {
  ticketUrl: string | null
  description: string | null
} {
  if (!description) return { ticketUrl: null, description: null }
  for (const match of description.matchAll(ANCHOR_RE)) {
    const [anchor, href, text] = match
    if (CTA_TEXT_RE.test(text.replace(/<[^>]*>/g, ""))) {
      return {
        ticketUrl: href.replace(/&amp;/g, "&"),
        description: tidyDescription(description.replace(anchor, "")),
      }
    }
  }
  const match = description.match(TICKET_TAILOR_RE)
  return {
    ticketUrl: match ? match[0] : null,
    description: tidyDescription(description),
  }
}

const EMPTY_INLINE_RE = /<(b|strong|u|em|i)>\s*<\/\1>/gi
const EDGE_BREAKS_RE = /^(?:\s|<br\s*\/?>|<p>\s*<\/p>)+|(?:\s|<br\s*\/?>|<p>\s*<\/p>)+$/gi
const REPEATED_BREAKS_RE = /(?:<br\s*\/?>\s*){3,}/gi

export function tidyDescription(html: string): string | null {
  let out = html
  let previous
  do {
    previous = out
    out = out.replace(EMPTY_INLINE_RE, "")
  } while (out !== previous)
  out = out.replace(EDGE_BREAKS_RE, "").replace(REPEATED_BREAKS_RE, "<br><br>")
  return out || null
}

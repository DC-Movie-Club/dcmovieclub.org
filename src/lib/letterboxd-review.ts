import { decodeEntities } from "./link-preview.ts"

// The club's account posts a member's review in quotes, then a ____ or ----
// rule, "Review by @handle" (or "Review submitted by") and the member's bio.
// Its own reviews have no rule. A member's own rating ("★★★★" or "★★★.5") may
// trail the quote.
export function splitReview(html: string): {
  quote: string
  reviewer: string | null
} {
  const [quoteHtml, credit] = html.split(/_{3,}|-{3,}/)
  const text = decodeEntities(
    quoteHtml.replace(/<br\s*\/?>|<\/p>/gi, " ").replace(/<[^>]+>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*★+(?:\.5|½)?$/, "")
  // A member's review is wrapped in quotes even when it quotes something
  // itself; the club's own only lose quote marks that hold all of it
  const quote = (
    credit === undefined
      ? text.replace(/^"([^"]*)"$|^“([^“”]*)”$/, "$1$2")
      : text.replace(/^["“]([\s\S]*)["”]$/, "$1")
  ).trim()
  const reviewer =
    credit
      ?.replace(/<[^>]+>/g, "\n")
      .match(/Review\s+(?:submitted\s+)?by:?\s*([^\n:]+)/i)?.[1]
      .trim()
      .replace(/^@\s+/, "@") ?? null
  return { quote, reviewer }
}

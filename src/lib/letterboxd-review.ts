const ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
}

// The club's account posts a member's review in quotes, then a ____ rule,
// "Review by @handle" and the member's bio. Its own reviews have no rule.
// A member's own rating ("★★★★" or "★★★.5") may trail the quote.
export function splitReview(html: string): {
  quote: string
  reviewer: string | null
} {
  const [quoteHtml, credit = ""] = html.split(/_{3,}/)
  const quote = quoteHtml
    .replace(/<br\s*\/?>|<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x?)?(\w+);/gi, (entity, numeric: string | undefined, code: string) =>
      numeric
        ? String.fromCodePoint(parseInt(code, numeric.toLowerCase() === "#x" ? 16 : 10))
        : (ENTITIES[code] ?? entity),
    )
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*★+(?:\.5|½)?$/, "")
    .replace(/^"([^"]*)"$|^“([^“”]*)”$/, "$1$2")
    .trim()
  const reviewer =
    credit
      .replace(/<[^>]+>/g, "\n")
      .match(/Review by\s+([^\n:]+)/i)?.[1]
      .trim() ?? null
  return { quote, reviewer }
}

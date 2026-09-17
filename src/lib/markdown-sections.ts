export type MarkdownSection = {
  heading: string | null
  body: string
}

const SECTION_HEADING_RE = /^##\s+(.+?)\s*#*\s*$/

// Splits admin-written markdown on its "## " headings so each section can be
// laid out on its own. Text before the first heading becomes a headless section.
export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = []
  let current: MarkdownSection = { heading: null, body: "" }

  const flush = () => {
    const body = current.body.trim()
    if (current.heading !== null || body) {
      sections.push({ heading: current.heading, body })
    }
  }

  for (const line of markdown.split("\n")) {
    const match = line.match(SECTION_HEADING_RE)
    if (match) {
      flush()
      current = { heading: match[1], body: "" }
    } else {
      current.body += `${line}\n`
    }
  }
  flush()

  return sections
}

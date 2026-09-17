// Minimal hast shapes; the full `hast` types aren't a direct dependency.
type HastText = { type: "text"; value: string }
type HastElement = {
  type: "element"
  tagName: string
  properties: Record<string, unknown>
  children: HastNode[]
}
type HastNode = HastElement | HastText | { type: string }
type HastRoot = { type: "root"; children: HastNode[] }

export type SectionsOptions = {
  depth: 2 | 3
}

function element(tagName: string, children: HastNode[]): HastElement {
  return { type: "element", tagName, properties: {}, children }
}

function headingLevel(node: HastNode) {
  if (node.type !== "element") return null
  const match = /^h([1-6])$/.exec((node as HastElement).tagName)
  return match ? Number(match[1]) : null
}

function isBlank(nodes: HastNode[]) {
  return nodes.every(
    (node) => node.type === "text" && !(node as HastText).value.trim(),
  )
}

// Wraps each top-level heading at `depth`, plus the content that follows it up
// to the next heading at the same or a higher level, in section → [heading,
// div(body)]. Content before the first heading becomes a headless section →
// [div(body)] so it can be styled like the rest.
export function rehypeSections({ depth }: SectionsOptions) {
  return (tree: HastRoot) => {
    const children: HastNode[] = []
    let heading: HastElement | null = null
    let body: HastNode[] = []

    const flush = () => {
      if (heading) {
        children.push(element("section", [heading, element("div", body)]))
      } else if (!isBlank(body)) {
        children.push(element("section", [element("div", body)]))
      } else {
        children.push(...body)
      }
      heading = null
      body = []
    }

    for (const node of tree.children) {
      const level = headingLevel(node)
      if (level === depth) {
        flush()
        heading = node as HastElement
      } else if (level !== null && level < depth) {
        flush()
        children.push(node)
      } else {
        body.push(node)
      }
    }
    flush()

    tree.children = children
  }
}

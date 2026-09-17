// Minimal mdast shapes; the full `mdast` types aren't a direct dependency.
type MdastNode = {
  type: string
  name?: string
  value?: string
  children?: MdastNode[]
  data?: Record<string, unknown>
  position?: { start: { offset?: number }; end: { offset?: number } }
}

const DIRECTIVE_TYPES = new Set([
  "containerDirective",
  "leafDirective",
  "textDirective",
])

function sourceOf(node: MdastNode, source: string) {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  return start === undefined || end === undefined
    ? ""
    : source.slice(start, end)
}

function transform(parent: MdastNode, source: string) {
  const children = parent.children
  if (!children) return

  children.forEach((node, i) => {
    if (node.type === "containerDirective" && node.name === "details") {
      node.data = { ...node.data, hName: "details" }
      const [label] = node.children ?? []
      if (label?.type === "paragraph" && label.data?.directiveLabel) {
        label.data = { ...label.data, hName: "summary" }
      }
    } else if (DIRECTIVE_TYPES.has(node.type)) {
      const text = { type: "text", value: sourceOf(node, source) }
      children[i] =
        node.type === "textDirective"
          ? text
          : { type: "paragraph", children: [text] }
      return
    }
    transform(node, source)
  })
}

// Runs after remark-directive. Maps `:::details[Question] … :::` to a native
// <details> whose label becomes the <summary>. Any other directive is put back
// as the text it was written as, so prose like "Tickets:TBA" isn't swallowed.
export function remarkDetails() {
  return (tree: MdastNode, file: { value: unknown }) => {
    transform(tree, String(file.value))
  }
}

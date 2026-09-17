import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { createEditor } from "lexical"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { LinkNode } from "@lexical/link"
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_STAR,
  HEADING,
  ITALIC_STAR,
  LINK,
  ORDERED_LIST,
  QUOTE,
  UNORDERED_LIST,
  type Transformer,
} from "@lexical/markdown"
import {
  createDetailsTransformer,
  DetailsContentNode,
  DetailsNode,
  DetailsSummaryNode,
} from "./DetailsNode.ts"

const DETAILS = createDetailsTransformer(() => TRANSFORMERS)
const TRANSFORMERS: Transformer[] = [
  DETAILS,
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_STAR,
  ITALIC_STAR,
  LINK,
]

function roundTrip(markdown: string) {
  const editor = createEditor({
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      DetailsNode,
      DetailsSummaryNode,
      DetailsContentNode,
    ],
    onError: (error) => {
      throw error
    },
  })
  editor.update(() => $convertFromMarkdownString(markdown, TRANSFORMERS), {
    discrete: true,
  })
  return editor
    .getEditorState()
    .read(() => $convertToMarkdownString(TRANSFORMERS))
}

describe("details markdown transformer", () => {
  it("round-trips a question with a multi-paragraph answer", () => {
    const markdown =
      ":::details[How do I join?]\nJust show up!\n\nFeel free to reach out.\n:::"
    assert.equal(roundTrip(markdown), markdown)
  })

  it("round-trips formatting and lists inside the answer", () => {
    const markdown =
      ":::details[What do you do?]\nWe host **screenings** and [trivia](https://example.com).\n\n- Happy hours\n- Genre circles\n:::"
    assert.equal(roundTrip(markdown), markdown)
  })

  it("round-trips formatting in the question", () => {
    const markdown = ":::details[Is it *really* free?]\nMostly.\n:::"
    assert.equal(roundTrip(markdown), markdown)
  })

  it("round-trips several blocks between normal content", () => {
    const markdown =
      "## FAQ\n\n:::details[One]\nA\n:::\n\n:::details[Two]\nB\n:::\n\nThe end."
    assert.equal(roundTrip(markdown), markdown)
  })

  it("keeps an empty answer as an empty block", () => {
    assert.equal(
      roundTrip(":::details[Coming soon]\n:::"),
      ":::details[Coming soon]\n\n:::",
    )
  })
})

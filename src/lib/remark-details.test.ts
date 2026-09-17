import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ReactMarkdown from "react-markdown"
import remarkDirective from "remark-directive"
import { remarkDetails } from "./remark-details.ts"

function render(markdown: string) {
  return renderToStaticMarkup(
    createElement(
      ReactMarkdown,
      { remarkPlugins: [remarkDirective, remarkDetails] },
      markdown,
    ),
  )
}

describe("remarkDetails", () => {
  it("renders a details block with its label as the summary", () => {
    assert.equal(
      render(":::details[How do I join?]\nJust show up!\n:::"),
      "<details><summary>How do I join?</summary><p>Just show up!</p></details>",
    )
  })

  it("keeps inline formatting in the summary and blocks in the body", () => {
    assert.equal(
      render(
        ":::details[Is it **free**?]\nMostly.\n\n- Screenings cost money\n- Trivia is free\n:::",
      ),
      "<details><summary>Is it <strong>free</strong>?</summary><p>Mostly.</p><ul>\n<li>Screenings cost money</li>\n<li>Trivia is free</li>\n</ul></details>",
    )
  })

  it("renders consecutive blocks separately", () => {
    assert.equal(
      render(":::details[A]\nOne\n:::\n\n:::details[B]\nTwo\n:::"),
      "<details><summary>A</summary><p>One</p></details>\n<details><summary>B</summary><p>Two</p></details>",
    )
  })

  it("renders a details block without a label", () => {
    assert.equal(
      render(":::details\nBody\n:::"),
      "<details><p>Body</p></details>",
    )
  })

  it("puts inline text directives back as written", () => {
    assert.equal(render("Tickets:TBA soon"), "<p>Tickets:TBA soon</p>")
  })

  it("leaves times and spaced colons alone", () => {
    assert.equal(
      render("Happy hour: 5:30PM, screening at 6:45"),
      "<p>Happy hour: 5:30PM, screening at 6:45</p>",
    )
  })

  it("puts unknown block directives back as written", () => {
    assert.equal(render("::note[hi]"), "<p>::note[hi]</p>")
  })
})

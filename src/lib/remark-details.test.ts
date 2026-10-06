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
  describe("details blocks", () => {
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

    it("reads escaped brackets in the label as brackets", () => {
      assert.equal(
        render(":::details[Is it \\[really\\] free?]\nYes\n:::"),
        "<details><summary>Is it [really] free?</summary><p>Yes</p></details>",
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
  })

  describe("other directives", () => {
    it("puts text directives back as written", () => {
      assert.equal(
        render("Tickets:TBA soon, RSVP:here[now] and Doors:7{pm}"),
        "<p>Tickets:TBA soon, RSVP:here[now] and Doors:7{pm}</p>",
      )
    })

    it("puts them back inside a details body too", () => {
      assert.equal(
        render(":::details[When?]\nTickets:TBA, doors at 6:30\n:::"),
        "<details><summary>When?</summary><p>Tickets:TBA, doors at 6:30</p></details>",
      )
    })

    it("puts unknown leaf and container directives back as written", () => {
      assert.equal(render("::note[hi]"), "<p>::note[hi]</p>")
      assert.equal(
        render(":::note\nSome text\n:::"),
        "<p>:::note\nSome text\n:::</p>",
      )
    })
  })

  it("leaves times, ratios, spaced colons and links alone", () => {
    assert.equal(
      render(
        "Happy hour: 5:30PM, screening at 6:45 in 16:9. Email [Abbie](mailto:abbie@dcmovieclub.org)",
      ),
      '<p>Happy hour: 5:30PM, screening at 6:45 in 16:9. Email <a href="mailto:abbie@dcmovieclub.org">Abbie</a></p>',
    )
  })
})

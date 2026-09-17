import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { rehypeSections, type SectionsOptions } from "./rehype-sections.ts"

const text = (value: string) => ({ type: "text", value })
const el = (tagName: string, ...children: object[]) => ({
  type: "element",
  tagName,
  properties: {},
  children,
})

function run(options: SectionsOptions, children: object[]) {
  const tree = { type: "root" as const, children } as Parameters<
    ReturnType<typeof rehypeSections>
  >[0]
  rehypeSections(options)(tree)
  return tree.children
}

describe("rehypeSections", () => {
  const options = { depth: 2 } as const

  it("groups each heading with the content under it", () => {
    assert.deepEqual(
      run(options, [
        el("h2", text("Mission")),
        text("\n"),
        el("p", text("Bring people together")),
        el("h2", text("Follow Us")),
        el("ul", el("li", text("Instagram"))),
      ]),
      [
        el(
          "section",
          el("h2", text("Mission")),
          el("div", text("\n"), el("p", text("Bring people together"))),
        ),
        el(
          "section",
          el("h2", text("Follow Us")),
          el("div", el("ul", el("li", text("Instagram")))),
        ),
      ],
    )
  })

  it("wraps content before the first heading in a headless section", () => {
    assert.deepEqual(
      run(options, [el("p", text("Intro")), el("h2", text("Mission"))]),
      [
        el("section", el("div", el("p", text("Intro")))),
        el("section", el("h2", text("Mission")), el("div")),
      ],
    )
  })

  it("ignores blank leading whitespace", () => {
    assert.deepEqual(run(options, [text("\n"), el("h2", text("A"))]), [
      text("\n"),
      el("section", el("h2", text("A")), el("div")),
    ])
  })

  it("keeps deeper headings inside the body", () => {
    assert.deepEqual(
      run(options, [el("h2", text("A")), el("h3", text("Sub")), el("p", text("x"))]),
      [
        el(
          "section",
          el("h2", text("A")),
          el("div", el("h3", text("Sub")), el("p", text("x"))),
        ),
      ],
    )
  })

  it("does not touch headings nested inside other blocks", () => {
    const quote = el("blockquote", el("h2", text("Quoted")))
    assert.deepEqual(run(options, [quote]), [el("section", el("div", quote))])
  })
})

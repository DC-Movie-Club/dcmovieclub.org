import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { markdownStyles, proseHtml } from "./markdownStyles.ts"
import { proseHeadings } from "./textStyles.ts"

const htmlRules = new Set(proseHtml.split(/\s+/))

// Every class, scoped to `tag` inside the wrapper
function assertInHtml(classes: string, tag: string) {
  for (const name of classes.split(/\s+/)) {
    const rule = `[&_${tag}]:${name}`
    assert.ok(htmlRules.has(rule), `proseHtml is missing ${rule}`)
  }
}

describe("proseHtml", () => {
  it("styles HTML the way markdownStyles styles Markdown", () => {
    assertInHtml(markdownStyles.h2, "h2")
    assertInHtml(markdownStyles.h3, "h3")
    assertInHtml(markdownStyles.p, "p")
    assertInHtml(markdownStyles.link, "a")
  })

  it("gives h4, which only HTML has, its prose heading", () => {
    assertInHtml(proseHeadings.h4, "h4")
  })

  it("catches a class that's missing", () => {
    assert.throws(() => assertInHtml("text-9xl", "p"))
  })
})

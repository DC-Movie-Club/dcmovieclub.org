import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { splitMarkdownSections } from "./markdown-sections.ts"

describe("splitMarkdownSections", () => {
  it("splits on ## headings and trims bodies", () => {
    assert.deepEqual(
      splitMarkdownSections(
        "## Let's Collaborate!\n\nIntro text.\n\n## Current Partners\n\n- Whisked\n- Alamo Drafthouse\n",
      ),
      [
        { heading: "Let's Collaborate!", body: "Intro text." },
        { heading: "Current Partners", body: "- Whisked\n- Alamo Drafthouse" },
      ],
    )
  })

  it("keeps text before the first heading as a headless section", () => {
    assert.deepEqual(splitMarkdownSections("Welcome!\n\n## Details\nMore"), [
      { heading: null, body: "Welcome!" },
      { heading: "Details", body: "More" },
    ])
  })

  it("does not split on deeper headings or mid-line hashes", () => {
    assert.deepEqual(
      splitMarkdownSections("## Top\n### Sub\nSee #2 and ##3"),
      [{ heading: "Top", body: "### Sub\nSee #2 and ##3" }],
    )
  })

  it("strips closing hashes from a heading", () => {
    assert.deepEqual(splitMarkdownSections("## Get in Touch ##\nHi"), [
      { heading: "Get in Touch", body: "Hi" },
    ])
  })

  it("keeps a heading with an empty body", () => {
    assert.deepEqual(splitMarkdownSections("## Coming soon"), [
      { heading: "Coming soon", body: "" },
    ])
  })

  it("returns nothing for blank copy", () => {
    assert.deepEqual(splitMarkdownSections("  \n\n"), [])
  })
})

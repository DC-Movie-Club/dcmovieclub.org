import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { plainText } from "./plain-text.ts"

// Inputs are shaped like the admin editor's markdown export.

describe("plainText", () => {
  it("drops headings, quotes, list markers, emphasis and link targets", () => {
    assert.equal(
      plainText(
        "## What to bring\n\n- **Free** popcorn\n- [Tickets](https://buytickets.at/dcmovieclub/1)\n1. Arrive *early*\n> Bring a friend",
      ),
      "What to bring Free popcorn Tickets Arrive early Bring a friend",
    )
  })

  it("keeps characters the editor escaped", () => {
    assert.equal(
      plainText("Use code **DCMC\\_25** for 25% off, rated 4.5\\* in C:\\\\films"),
      "Use code DCMC_25 for 25% off, rated 4.5* in C:\\films",
    )
  })

  it("shows a video embed as its bare link", () => {
    assert.equal(
      plainText("Watch the trailer:\n\n<https://www.youtube.com/watch?v=dQw4w9WgXcQ>"),
      "Watch the trailer: https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    )
  })

  it("leaves dashes, plus signs and numbers inside a line alone", () => {
    const text = "Tickets are $10 - $14 at 7:30. Ages 21+ only"
    assert.equal(plainText(text), text)
  })

  it("flattens everything onto one line", () => {
    assert.equal(plainText("  Line one\n\nLine two   three\n"), "Line one Line two three")
  })
})

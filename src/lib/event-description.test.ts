import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  extractTicket,
  isHoldEvent,
  tidyDescription,
} from "./event-description.ts"

describe("extractTicket", () => {
  it("returns nulls for a missing description", () => {
    assert.deepEqual(extractTicket(undefined), {
      ticketUrl: null,
      description: null,
    })
  })

  it("picks a non-Ticket Tailor link by its anchor text and removes it", () => {
    const result = extractTicket(
      '<a href="https://forms.gle/abc">Reserve tickets here before 8/24</a><br><br>Thank you for your interest in <a href="https://sigtheatre.org/show"><u>Merrily</u></a>!',
    )
    assert.equal(result.ticketUrl, "https://forms.gle/abc")
    assert.equal(
      result.description,
      'Thank you for your interest in <a href="https://sigtheatre.org/show"><u>Merrily</u></a>!',
    )
  })

  it("matches anchor text wrapped in formatting tags", () => {
    const result = extractTicket(
      '<a href="https://buytickets.at/dcmovieclub/1"><b>Register here!</b></a><br>Monthly happy hour',
    )
    assert.equal(result.ticketUrl, "https://buytickets.at/dcmovieclub/1")
    assert.equal(result.description, "Monthly happy hour")
  })

  it("decodes &amp; in the ticket URL", () => {
    const result = extractTicket(
      'Screening at 6:45<br><br><a href="https://drafthouse.com/show?a=1&amp;b=2"><b>TICKETS</b></a>',
    )
    assert.equal(result.ticketUrl, "https://drafthouse.com/show?a=1&b=2")
    assert.equal(result.description, "Screening at 6:45")
  })

  it("uses the first link whose text looks like a CTA", () => {
    const result = extractTicket(
      '<a href="https://example.com/info">More info</a> and <a href="https://example.com/buy">Buy tickets</a>',
    )
    assert.equal(result.ticketUrl, "https://example.com/buy")
    assert.equal(
      result.description,
      '<a href="https://example.com/info">More info</a> and',
    )
  })

  it("falls back to a bare Ticket Tailor URL and leaves the text alone", () => {
    const result = extractTicket(
      "Get tickets at https://www.tickettailor.com/events/dcmovieclub/42 today",
    )
    assert.equal(
      result.ticketUrl,
      "https://www.tickettailor.com/events/dcmovieclub/42",
    )
    assert.equal(
      result.description,
      "Get tickets at https://www.tickettailor.com/events/dcmovieclub/42 today",
    )
  })

  it("returns no ticket when nothing matches", () => {
    assert.deepEqual(extractTicket("Tickets/details coming soon!"), {
      ticketUrl: null,
      description: "Tickets/details coming soon!",
    })
  })

  it("returns a null description when only the CTA link was present", () => {
    assert.deepEqual(
      extractTicket('<p><a href="https://example.com/t">TICKETS</a></p>'),
      { ticketUrl: "https://example.com/t", description: null },
    )
  })
})

describe("tidyDescription", () => {
  it("strips leading and trailing breaks and empty paragraphs", () => {
    assert.equal(
      tidyDescription("<br><p> </p>  <br/>Hello<br><br>"),
      "Hello",
    )
  })

  it("collapses three or more consecutive breaks to two", () => {
    assert.equal(tidyDescription("One<br><br><br><br>Two"), "One<br><br>Two")
  })

  it("keeps a single paragraph break intact", () => {
    assert.equal(tidyDescription("One<br><br>Two"), "One<br><br>Two")
  })

  it("removes nested empty formatting tags", () => {
    assert.equal(tidyDescription("<b><u></u></b>Hello"), "Hello")
  })

  it("returns null when nothing is left", () => {
    assert.equal(tidyDescription("<br><strong></strong><br>"), null)
  })
})

describe("isHoldEvent", () => {
  it("flags HOLD placeholders regardless of case or leading space", () => {
    assert.equal(isHoldEvent("HOLD: Screening | VERITY or DIGGER"), true)
    assert.equal(isHoldEvent("  hold: something"), true)
  })

  it("does not flag real events", () => {
    assert.equal(isHoldEvent("Screening | RESIDENT EVIL"), false)
    assert.equal(isHoldEvent("Household Horrors"), false)
    assert.equal(isHoldEvent(undefined), false)
  })
})

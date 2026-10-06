import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  extractTickets,
  isHoldEvent,
  tidyDescription,
} from "./event-description.ts"

describe("extractTickets", () => {
  it("returns no tickets for a missing description", () => {
    assert.deepEqual(extractTickets(undefined), {
      tickets: [],
      description: null,
    })
  })

  it("picks a non-Ticket Tailor link by its anchor text and keeps it in the description", () => {
    const description =
      '<a href="https://forms.gle/abc">Reserve tickets here before 8/24</a><br><br>Thank you for your interest in <a href="https://sigtheatre.org/show"><u>Merrily</u></a>!'
    const result = extractTickets(description)
    assert.deepEqual(result.tickets, [
      { label: "Reserve tickets here before 8/24", url: "https://forms.gle/abc" },
    ])
    assert.equal(result.description, description)
  })

  it("matches anchor text wrapped in formatting tags", () => {
    const result = extractTickets(
      '<a href="https://buytickets.at/dcmovieclub/1"><b>Register here!</b></a><br>Monthly happy hour',
    )
    assert.deepEqual(result.tickets, [
      { label: "Register here!", url: "https://buytickets.at/dcmovieclub/1" },
    ])
  })

  it("decodes &amp; in the ticket URL", () => {
    const result = extractTickets(
      'Screening at 6:45<br><br><a href="https://drafthouse.com/show?a=1&amp;b=2"><b>TICKETS</b></a>',
    )
    assert.deepEqual(result.tickets, [
      { label: "TICKETS", url: "https://drafthouse.com/show?a=1&b=2" },
    ])
  })

  it("skips links whose text doesn't look like a CTA", () => {
    const result = extractTickets(
      '<a href="https://example.com/info">More info</a> and <a href="https://example.com/buy">Buy tickets</a>',
    )
    assert.deepEqual(result.tickets, [
      { label: "Buy tickets", url: "https://example.com/buy" },
    ])
  })

  it("collects every ticket link, labeled without the word tickets", () => {
    const result = extractTickets(
      '<a href="https://drafthouse.com/verity"><b>VERITY TICKETS</b></a><br><b><br></b><br><a href="https://drafthouse.com/your-mother"><b>YOUR MOTHERx3 TICKETS</b></a><br><br><strong>Choice of either</strong>',
    )
    assert.deepEqual(result.tickets, [
      { label: "VERITY", url: "https://drafthouse.com/verity" },
      { label: "YOUR MOTHERx3", url: "https://drafthouse.com/your-mother" },
    ])
  })

  it("keeps one ticket per URL and decodes entities in labels", () => {
    const result = extractTickets(
      '<a href="https://example.com/t">Q&amp;A tickets</a> Doors at 7. <a href="https://example.com/t">Tickets</a>',
    )
    assert.deepEqual(result.tickets, [
      { label: "Q&A", url: "https://example.com/t" },
    ])
  })

  it("falls back to a bare Ticket Tailor URL", () => {
    const description =
      "Get tickets at https://www.tickettailor.com/events/dcmovieclub/42 today"
    assert.deepEqual(extractTickets(description), {
      tickets: [
        {
          label: "Tickets",
          url: "https://www.tickettailor.com/events/dcmovieclub/42",
        },
      ],
      description,
    })
  })

  it("returns no ticket when nothing matches", () => {
    assert.deepEqual(extractTickets("Tickets/details coming soon!"), {
      tickets: [],
      description: "Tickets/details coming soon!",
    })
  })

  it("tidies the description it returns", () => {
    assert.equal(
      extractTickets('<br><a href="https://example.com/t">TICKETS</a><br><br>')
        .description,
      '<a href="https://example.com/t">TICKETS</a>',
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

  it("unwraps formatting tags that only hold breaks", () => {
    assert.equal(
      tidyDescription("<br><b><br></b><br>Hello<b><br></b>World"),
      "Hello<br>World",
    )
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

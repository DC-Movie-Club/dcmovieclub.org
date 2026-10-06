import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  extractTickets,
  isHoldEvent,
  tidyDescription,
} from "./event-description.ts"

// Fixtures are trimmed from real event descriptions, as the Google Calendar
// API returns them: organizer-written HTML, or plain text from older events.

describe("extractTickets", () => {
  it("has nothing to extract from a missing or empty description", () => {
    for (const description of [undefined, ""]) {
      assert.deepEqual(extractTickets(description), {
        tickets: [],
        description: null,
      })
    }
  })

  it("finds a ticket link by its anchor text, whatever the host", () => {
    const links = {
      "Reserve tickets here before 8/24": "https://forms.gle/ixVPNnf8iTaHDzFm6",
      "RSVP HERE": "https://partiful.com/e/D2K58DDkt4AvOt6GGHCN?",
      "Register here!": "https://buytickets.at/dcmovieclub/2223616",
      "Purchase tickets here":
        "https://www.tickettailor.com/events/dcmovieclub/1969770",
    }
    for (const [text, url] of Object.entries(links)) {
      const { tickets } = extractTickets(
        `Happy hour: 5:30<br><br><a href="${url}">${text}</a>`,
      )
      assert.deepEqual(
        tickets.map((ticket) => ticket.url),
        [url],
        text,
      )
    }
  })

  it("reads anchor text through formatting tags, entities and spaces", () => {
    const { tickets } = extractTickets(
      '<a href="https://forms.gle/r8zoRukwA4bRJAF4A"><u><b>TICKETS</b></u></a><br><br>' +
        '<a href="https://app.tickettailor.com/events/dcmovieclub/1935458"><b>Register &amp; donate here</b></a>' +
        '<a href="https://docs.google.com/forms/d/e/1FAIpQLSc/viewform">Register for [FREE] tickets here </a>',
    )
    assert.deepEqual(
      tickets.map((ticket) => ticket.label),
      ["TICKETS", "Register & donate here", "Register for [FREE] tickets here"],
    )
  })

  it("reads a link whose text is its own URL, broken with <wbr>", () => {
    const { tickets } = extractTickets(
      'HH: 5:30 PM<br>Tickets here! <a href="https://drafthouse.com/ticketing/1101/68859" target="_blank">https://drafthouse.com/<wbr />ticketing/1101/68859</a>',
    )
    assert.deepEqual(tickets, [
      {
        label: "https://drafthouse.com/ticketing/1101/68859",
        url: "https://drafthouse.com/ticketing/1101/68859",
      },
    ])
  })

  it("finds the href wherever it sits among the attributes", () => {
    const { tickets } = extractTickets(
      '<a target="_blank" href="https://www.eventbrite.com/e/tickets-1993479258124"><b>TICKETS</b></a>',
    )
    assert.equal(
      tickets[0]?.url,
      "https://www.eventbrite.com/e/tickets-1993479258124",
    )
  })

  it("decodes &amp; in ticket URLs and keeps bare ampersands", () => {
    const { tickets } = extractTickets(
      '<a href="https://drafthouse.com/dc-metro-area/show/verity?showSeats=true&amp;cinemaId=1101&amp;sessionId=82172"><b>VERITY TICKETS</b></a><br>' +
        '<a href="https://relume.co/products/craft-a-long?_pos=2&_psq=devil+we" target="_blank">TICKETS</a>',
    )
    assert.deepEqual(
      tickets.map((ticket) => ticket.url),
      [
        "https://drafthouse.com/dc-metro-area/show/verity?showSeats=true&cinemaId=1101&sessionId=82172",
        "https://relume.co/products/craft-a-long?_pos=2&_psq=devil+we",
      ],
    )
  })

  it("skips links whose text isn't a call to action", () => {
    const { tickets } = extractTickets(
      'Join <a href="https://www.instagram.com/dcmovieclub/" target="_blank"><u>DC Movie Club</u></a> to see ' +
        '<a href="https://silver.afi.com/movies/detail/0100005584/"><u>BOWFINGER at AFI Silver Theatre</u></a>!<br>' +
        '<a href="https://forms.gle/7Z5hoMRKH3VaTuKS8">Reserve tickets here!</a>',
    )
    assert.deepEqual(tickets, [
      { label: "Reserve tickets here!", url: "https://forms.gle/7Z5hoMRKH3VaTuKS8" },
    ])
  })

  it("collects every ticket link in order, once per URL", () => {
    const { tickets } = extractTickets(
      'TONY: 6:30 <a href="https://drafthouse.com/dc-metro-area/show/tony">[TICKETS]</a><br>' +
        '<p>THE END OF OAK STREET: 6:45PM <a href="https://drafthouse.com/dc-metro-area/show/the-end-of-oak-street">[TICKETS]</a></p>' +
        '<p>Changed your mind? <a href="https://drafthouse.com/dc-metro-area/show/tony">Tickets</a></p>',
    )
    assert.deepEqual(
      tickets.map((ticket) => ticket.url),
      [
        "https://drafthouse.com/dc-metro-area/show/tony",
        "https://drafthouse.com/dc-metro-area/show/the-end-of-oak-street",
      ],
    )
  })

  it("labels each ticket by what's left of its text without the word tickets", () => {
    const { tickets } = extractTickets(
      '<a href="https://drafthouse.com/verity"><b>VERITY TICKETS</b></a><br><b><br></b><br>' +
        '<a href="https://drafthouse.com/your-mother"><b>YOUR MOTHERx3 TICKETS</b></a><br>' +
        '<a href="https://example.com/q-and-a">Q&amp;A tickets:</a>',
    )
    assert.deepEqual(
      tickets.map((ticket) => ticket.label),
      ["VERITY", "YOUR MOTHERx3", "Q&A"],
    )
  })

  it("keeps text that is only a call to action whole", () => {
    for (const text of ["TICKETS", "Tickets!", "Buy tickets!", "Get Tickets", "Reserve tickets"]) {
      const { tickets } = extractTickets(
        `<a href="https://example.com/t">${text}</a>`,
      )
      assert.equal(tickets[0]?.label, text)
    }
  })

  it("falls back to a bare Ticket Tailor URL in plain text", () => {
    const description =
      "We'll be watching (at home, on your own) & discussing \"Xanadu\".\n\nLimited tickets available here: https://www.tickettailor.com/events/dcmovieclub/2256885"
    assert.deepEqual(extractTickets(description), {
      tickets: [
        {
          label: "Tickets",
          url: "https://www.tickettailor.com/events/dcmovieclub/2256885",
        },
      ],
      description,
    })
  })

  it("ends a bare URL before the punctuation that follows it", () => {
    for (const end of [".", "!", ")", ","]) {
      const { tickets } = extractTickets(
        `Register (free!) at https://buytickets.at/dcmovieclub/2051783${end} See you there`,
      )
      assert.equal(tickets[0]?.url, "https://buytickets.at/dcmovieclub/2051783", end)
    }
  })

  it("decodes &amp; in a fallback URL taken from a link that isn't a call to action", () => {
    const { tickets } = extractTickets(
      '<a href="https://www.tickettailor.com/checkout/view-event/id/7924345/chk/ef79/?modal_widget=true&amp;widget=true"><span>Welcome to "Film Takes on Tap"</span><b></b></a>',
    )
    assert.deepEqual(tickets, [
      {
        label: "Tickets",
        url: "https://www.tickettailor.com/checkout/view-event/id/7924345/chk/ef79/?modal_widget=true&widget=true",
      },
    ])
  })

  it("only falls back when no link reads as a call to action", () => {
    const { tickets } = extractTickets(
      '<a href="https://www.tickettailor.com/checkout/view-event/id/7924345">Welcome!</a><br>' +
        '<a href="https://www.tickettailor.com/events/dcmovieclub/2142735"><b>Register here</b></a>',
    )
    assert.deepEqual(
      tickets.map((ticket) => ticket.url),
      ["https://www.tickettailor.com/events/dcmovieclub/2142735"],
    )
  })

  it("finds nothing while tickets are still to come", () => {
    for (const description of [
      "Tickets: COMING SOON\nHappy Hour: 5:30 PM at theater bar",
      "More tickets/info coming soon!",
      "Location TBD",
    ]) {
      assert.deepEqual(extractTickets(description), {
        tickets: [],
        description,
      })
    }
  })

  it("returns the description tidied, with its ticket links left in", () => {
    assert.equal(
      extractTickets(
        '<br><br><a href="https://app.tickettailor.com/events/dcmovieclub/2415480"><b>TICKETS!</b></a><br><br>Genre circle<p><br></p>',
      ).description,
      '<a href="https://app.tickettailor.com/events/dcmovieclub/2415480"><b>TICKETS!</b></a><br><br>Genre circle',
    )
  })
})

describe("tidyDescription", () => {
  it("strips breaks, whitespace and empty paragraphs from both ends", () => {
    assert.equal(
      tidyDescription("<br><br><br><b>Details:</b><br>Screening: 7:00PM<br><p> </p>  <br/>"),
      "<b>Details:</b><br>Screening: 7:00PM",
    )
  })

  it("strips paragraphs holding only a break from both ends", () => {
    assert.equal(
      tidyDescription(
        '<p><br></p><p><a href="https://app.tickettailor.com/events/dcmovieclub/2168124">Grab your tickets here!</a></p><p><br></p>',
      ),
      '<p><a href="https://app.tickettailor.com/events/dcmovieclub/2168124">Grab your tickets here!</a></p>',
    )
  })

  it("keeps blank lines between paragraphs", () => {
    const html =
      "<p>Hook Hall Garden space</p><p><br></p><p>Attire: costumes!</p><p></p><p>FAQ</p>"
    assert.equal(tidyDescription(html), html)
  })

  it("treats non-breaking spaces as whitespace", () => {
    assert.equal(
      tidyDescription(" <br>HH: 5:30 PM Alamo bar<br> <br> <br>Tickets here: <br> "),
      "HH: 5:30 PM Alamo bar<br><br>Tickets here:",
    )
  })

  it("collapses three or more breaks in a row to two", () => {
    assert.equal(
      tidyDescription("Screening: 6:45PM<br><br><br>When you purchase<br />\n<br>\n<br/> <br>Please RSVP"),
      "Screening: 6:45PM<br><br>When you purchase<br><br>Please RSVP",
    )
  })

  it("keeps one or two breaks in a row as written", () => {
    const html = "Happy hour: 5:30<br>Screening: 6:45<br><br>Tickets!"
    assert.equal(tidyDescription(html), html)
  })

  it("unwraps formatting tags that hold only breaks or spaces", () => {
    assert.equal(
      tidyDescription(
        "<b>TICKETS</b><br><b><br></b><br><b>Second theater</b> and <em><i> </i></em>more<em><i><br></i></em>6:00pm",
      ),
      "<b>TICKETS</b><br><br><b>Second theater</b> and  more<br>6:00pm",
    )
  })

  it("removes empty formatting tags, however deeply nested", () => {
    assert.equal(
      tidyDescription(
        "<strong><b>The Conversation (1974)</b></strong><strong><b></b></strong> and <STRONG><b><u></u></b></STRONG>more",
      ),
      "<strong><b>The Conversation (1974)</b></strong> and more",
    )
  })

  it("returns null when nothing is left", () => {
    assert.equal(tidyDescription("<br><strong><b> </b></strong><p><br></p> "), null)
  })
})

describe("isHoldEvent", () => {
  it("flags HOLD placeholders regardless of case or leading space", () => {
    for (const title of ["HOLD: Oscar Shorts TBD", "  hold:something", "Hold: x"]) {
      assert.equal(isHoldEvent(title), true, title)
    }
  })

  it("does not flag real events", () => {
    for (const title of ["Screening | RESIDENT EVIL", "Household Horrors", "Genre Circle: on hold:", "", undefined]) {
      assert.equal(isHoldEvent(title), false, String(title))
    }
  })
})

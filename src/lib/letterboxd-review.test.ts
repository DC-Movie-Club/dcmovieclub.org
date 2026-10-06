import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { splitReview } from "./letterboxd-review.ts"

// Fixtures are trimmed from the club's real Letterboxd reviews, as the API
// returns them.

describe("splitReview", () => {
  it("separates a member's quote from the credit and bio", () => {
    assert.deepEqual(
      splitReview(
        "<p>&quot;Chris Hanson: Portrait of a Sociopath. </p><p>Godspeed, Robert Pattinson.&quot;<br />___________________________________<br />Review by @marinadedave:<br />&quot;Character actor aficionado, True Detective 2 defender&quot;</p>",
      ),
      {
        quote: "Chris Hanson: Portrait of a Sociopath. Godspeed, Robert Pattinson.",
        reviewer: "@marinadedave",
      },
    )
  })

  it("leaves the club's own review whole, with no reviewer", () => {
    assert.deepEqual(
      splitReview("<p>as far as sequels go, it&#039;s not as good as paddington 2, but tbh what is?</p>"),
      {
        quote: "as far as sequels go, it's not as good as paddington 2, but tbh what is?",
        reviewer: null,
      },
    )
  })

  it("accepts a rule of dashes as well as underscores", () => {
    assert.deepEqual(
      splitReview(
        "<p>&quot;I hope to see another part and work from Kane Parsons!&quot;<br />--------------<br />Review by Imani Agbionu (letterboxd-less)<br />&quot;My name is Imani and I am a Washington DC native.&quot;</p>",
      ),
      {
        quote: "I hope to see another part and work from Kane Parsons!",
        reviewer: "Imani Agbionu (letterboxd-less)",
      },
    )
    assert.deepEqual(
      splitReview(
        "<p>&quot;I wanted to live in that shot forever.&quot;<br />---<br />Review submitted  by @wpk914<br />&quot;Former Cali boy, now a respectable DMV fella.&quot;</p>",
      ),
      { quote: "I wanted to live in that shot forever.", reviewer: "@wpk914" },
    )
  })

  it("reads the reviewer from each way the credit gets written", () => {
    const credits = {
      "Review by @Faniac19<br />&quot;Another movie lover&quot;": "@Faniac19",
      "review by @adg2110:<br />self-proclaimed president of the paddington 2 fan club": "@adg2110",
      "Review submitted by @sethtaylor:<br />“Long time movie club supporter”": "@sethtaylor",
      "Review by: riocarmine<br />&quot;Mainer in DC, watching movies&quot;": "riocarmine",
      "Review by @hydrosulfric <br />&quot;Fake cinephile raised in the DMV&quot;": "@hydrosulfric",
      "Review by @ daphneyquinn<br />&quot;Regular DCMC attendee&quot;": "@daphneyquinn",
      "Review by @agagne</p><p>&quot;Just a humble public servant&quot;": "@agagne",
    }
    for (const [credit, reviewer] of Object.entries(credits)) {
      assert.equal(
        splitReview(`<p>&quot;Loved it.&quot;<br />______<br />${credit}</p>`).reviewer,
        reviewer,
        credit,
      )
    }
  })

  it("has no reviewer when the credit doesn't name one", () => {
    assert.equal(splitReview("<p>&quot;Loved it.&quot;<br />____<br />Thanks for reading!</p>").reviewer, null)
  })

  it("drops the member's trailing star rating", () => {
    for (const rating of ["★★★★", "★★★.5", "★★★½", "★"]) {
      assert.equal(
        splitReview(
          `<p>&quot;Easily the best one with Tom Holland yet!&quot;<br />${rating}<br />________________________<br />Review by @Faniac19</p>`,
        ).quote,
        "Easily the best one with Tom Holland yet!",
        rating,
      )
    }
  })

  it("keeps the first of several reviews in one entry", () => {
    assert.deepEqual(
      splitReview(
        '<p>"Easily the best one with Tom Holland yet!"<br>★★★★<br>______<br>Review by @Faniac19<br>"Another movie lover"</p><p>___</p><p>"Beautiful visually"<br>______<br>Review by Ben</p>',
      ),
      { quote: "Easily the best one with Tom Holland yet!", reviewer: "@Faniac19" },
    )
  })

  it("unwraps a member's review that quotes something itself", () => {
    assert.equal(
      splitReview(
        "<p>&quot;Feels very much like a play.</p><p>It feels more like &quot;Booksmart&quot; than &quot;Don’t Worry Darling&quot;, but very much its own thing.&quot;<br />____________<br />Review by @PlatypusBear</p>",
      ).quote,
      'Feels very much like a play. It feels more like "Booksmart" than "Don’t Worry Darling", but very much its own thing.',
    )
    assert.equal(
      splitReview(
        "<p>&quot; &#039;Jeff, do you hear what I&#039;m dealing with right now?&#039;</p><p>Ryan &quot;Darth&quot; Bader is great. &quot; <br />___<br />Review submitted by @SUPERBRUTAL_</p>",
      ).quote,
      `'Jeff, do you hear what I'm dealing with right now?' Ryan "Darth" Bader is great.`,
    )
  })

  it("unwraps the club's own review only when one pair of quotes holds all of it", () => {
    assert.equal(splitReview("<p>“Perfection, no notes”</p>").quote, "Perfection, no notes")
    assert.equal(
      splitReview('<p>"Barbie" is the year&#8217;s best &amp; so is "Oppenheimer"</p>').quote,
      '"Barbie" is the year’s best & so is "Oppenheimer"',
    )
  })

  it("decodes named, decimal and hex entities and flattens whitespace", () => {
    assert.equal(
      splitReview("<p>Q&amp;A&nbsp;was\n  great &#8212; it&#x27;s <i>&lt;3</i></p>").quote,
      "Q&A was great — it's <3",
    )
  })

  it("leaves malformed or out-of-range entities as written", () => {
    assert.equal(
      splitReview("<p>Bad &#xZZ; and &#99999999; codes</p>").quote,
      "Bad &#xZZ; and &#99999999; codes",
    )
  })

  it("keeps emoji and other text intact", () => {
    assert.equal(
      splitReview("<p>&quot;Fully Converted 🧎🧎🧎&quot;<br />______<br />Review by @dmitcham<br />DMV, Soup Enthusiast</p>").quote,
      "Fully Converted 🧎🧎🧎",
    )
  })
})

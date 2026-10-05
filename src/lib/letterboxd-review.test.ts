import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { splitReview } from "./letterboxd-review.ts"

describe("splitReview", () => {
  it("separates a member's quote from the credit and bio", () => {
    assert.deepEqual(
      splitReview(
        '<p>"Chris Hanson: Portrait of a Sociopath. </p><p>Godspeed, Robert Pattinson."<br>___________<br>Review by @marinadedave:<br>"Character actor aficionado"</p>',
      ),
      {
        quote: "Chris Hanson: Portrait of a Sociopath. Godspeed, Robert Pattinson.",
        reviewer: "@marinadedave",
      },
    )
  })

  it("drops the member's trailing star rating and keeps the first of several reviews", () => {
    assert.deepEqual(
      splitReview(
        '<p>"Easily the best one with Tom Holland yet!"<br>★★★★<br>______<br>Review by @Faniac19<br>"Another movie lover"</p><p>___</p><p>"Beautiful visually"<br>★★★.5<br>______<br>Review by Ben</p>',
      ),
      { quote: "Easily the best one with Tom Holland yet!", reviewer: "@Faniac19" },
    )
  })

  it("leaves the club's own review whole, with no reviewer", () => {
    assert.deepEqual(splitReview("<p>Perfection, no notes</p>"), {
      quote: "Perfection, no notes",
      reviewer: null,
    })
  })

  it("keeps quote marks that don't wrap the whole review", () => {
    assert.equal(
      splitReview('<p>"Barbie" is the year&#8217;s best &amp; so is "Oppenheimer"</p>').quote,
      '"Barbie" is the year’s best & so is "Oppenheimer"',
    )
  })
})

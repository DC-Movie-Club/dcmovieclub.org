import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { cleanSubstackBody } from "./substack-body.ts"

describe("cleanSubstackBody", () => {
  it("drops the subscribe widget along with its text", () => {
    assert.equal(
      cleanSubstackBody(
        '<p>See ya</p><div class="subscription-widget-wrap-editor" data-attrs="{}"><div class="subscription-widget show-subscribe"><div class="preamble"><p class="cta-caption">This Substack is reader-supported.</p></div><form class="subscription-widget-subscribe"><input type="email" name="email"><input type="submit" value="Subscribe"></form></div></div>',
      ),
      "<p>See ya</p>",
    )
  })

  it("keeps an image but not its link, expand buttons, or webp sources", () => {
    assert.equal(
      cleanSubstackBody(
        '<div class="captioned-image-container"><figure><a class="image-link image2 is-viewable-img" target="_blank" href="https://substackcdn.com/full.png"><div class="image2-inset"><picture><source type="image/webp" srcset="https://substackcdn.com/a.webp 424w"><img src="https://substackcdn.com/a.png" width="1200" height="630" class="sizing-normal" alt="" loading="lazy"></picture><div class="image-link-expand"><div class="pencraft"><button type="button"><svg><path d="M1"></path></svg></button></div></div></div></a></figure></div><p><strong>Details</strong></p>',
      ),
      '<div><figure><div><img src="https://substackcdn.com/a.png" width="1200" height="630" alt="" loading="lazy" /></div></figure></div><p><strong>Details</strong></p>',
    )
  })

  it("keeps buttons as plain links marked .button", () => {
    assert.equal(
      cleanSubstackBody(
        '<p class="button-wrapper" data-attrs="{}"><a class="button primary button-wrapper" href="https://tickettailor.com/x"><span>Tickets!</span></a></p>',
      ),
      '<p><a class="button" href="https://tickettailor.com/x">Tickets!</a></p>',
    )
  })

  it("drops empty paragraphs but keeps rules", () => {
    assert.equal(cleanSubstackBody("<p>One</p><p></p><div><hr></div>"), "<p>One</p><div><hr /></div>")
  })

  it("keeps a paragraph whose only content is an image inside a link or span", () => {
    assert.equal(
      cleanSubstackBody('<p><a href="https://example.com/full"><img src="https://substackcdn.com/a.png" alt=""></a></p>'),
      '<p><a href="https://example.com/full"><img src="https://substackcdn.com/a.png" alt="" /></a></p>',
    )
    assert.equal(
      cleanSubstackBody('<p><span><img src="https://substackcdn.com/a.png"></span></p>'),
      '<p><img src="https://substackcdn.com/a.png" /></p>',
    )
  })

  it("still drops an empty paragraph after one holding an image", () => {
    assert.equal(
      cleanSubstackBody('<p><span><img src="https://substackcdn.com/a.png"></span></p><p><a href="https://example.com"></a></p>'),
      '<p><img src="https://substackcdn.com/a.png" /></p>',
    )
  })

  it("keeps YouTube embeds but drops ones from other hosts", () => {
    assert.equal(
      cleanSubstackBody(
        '<div class="youtube-wrap"><iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe></div><div class="spotify-wrap"><iframe src="https://open.spotify.com/embed/episode/1" height="152"></iframe></div><p><iframe src="https://player.vimeo.com/video/1"></iframe></p>',
      ),
      '<div><iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe></div><div></div>',
    )
  })

  it("shows a gallery as its single composite image", () => {
    assert.equal(
      cleanSubstackBody(
        '<div class="image-gallery-embed" data-attrs="{&quot;gallery&quot;:{&quot;images&quot;:[],&quot;staticGalleryImage&quot;:{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/g.png&quot;}}}"></div>',
      ),
      '<img src="https://substack-post-media.s3.amazonaws.com/g.png" alt="" loading="lazy" />',
    )
  })
})

import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { linkKind, withExternalLinks } from "./external-links.ts"

const NEW_TAB = 'target="_blank" rel="noopener noreferrer"'

// Inputs are shaped like event descriptions and cleaned blog posts.

describe("withExternalLinks", () => {
  it("opens a plain link in a new tab", () => {
    assert.equal(
      withExternalLinks('<a href="https://forms.gle/ixVPNnf8iTaHDzFm6">Reserve tickets here before 8/24</a>'),
      `<a href="https://forms.gle/ixVPNnf8iTaHDzFm6" ${NEW_TAB}>Reserve tickets here before 8/24</a>`,
    )
  })

  it("keeps a link's own target or rel and adds the other", () => {
    assert.equal(
      withExternalLinks(
        '<a href="https://www.instagram.com/dcmovieclub/" target="_blank">Instagram</a> and <a target="_blank" href="https://dciff-indie.org/">DCIFF</a>',
      ),
      '<a href="https://www.instagram.com/dcmovieclub/" target="_blank" rel="noopener noreferrer">Instagram</a> and <a target="_blank" href="https://dciff-indie.org/" rel="noopener noreferrer">DCIFF</a>',
    )
    assert.equal(
      withExternalLinks('<a href="https://example.com" rel="nofollow">x</a>'),
      '<a href="https://example.com" rel="nofollow" target="_blank">x</a>',
    )
  })

  it("rewrites every link and no other tag", () => {
    assert.equal(
      withExternalLinks(
        '<p><a class="button" href="https://www.tickettailor.com/events/dcmovieclub/2406456">Tickets!</a></p><p><abbr>DCMC</abbr> <b>bold</b> <a href="https://dcmovieclub.substack.com/p/recap">recap</a></p>',
      ),
      `<p><a class="button" href="https://www.tickettailor.com/events/dcmovieclub/2406456" ${NEW_TAB}>Tickets!</a></p><p><abbr>DCMC</abbr> <b>bold</b> <a href="https://dcmovieclub.substack.com/p/recap" ${NEW_TAB}>recap</a></p>`,
    )
  })

  it("matches the tag in any case and across lines", () => {
    assert.equal(
      withExternalLinks('<A HREF="https://example.com">x</A><a\n  href="https://example.org">y</a>'),
      `<a HREF="https://example.com" ${NEW_TAB}>x</A><a\n  href="https://example.org" ${NEW_TAB}>y</a>`,
    )
  })
})

describe("linkKind", () => {
  it("routes paths on this site", () => {
    assert.equal(linkKind("/events"), "internal")
    assert.equal(linkKind("/about#conduct"), "internal")
  })

  it("opens other sites in a new tab, protocol-relative ones included", () => {
    assert.equal(linkKind("https://dcmovieclub.substack.com"), "external")
    assert.equal(linkKind("http://example.com/a"), "external")
    assert.equal(linkKind("//example.com"), "external")
  })

  it("opens mail, phone and anchors in place", () => {
    assert.equal(linkKind("mailto:hello@dcmovieclub.org"), "plain")
    assert.equal(linkKind("MAILTO:hello@dcmovieclub.org"), "plain")
    assert.equal(linkKind("tel:+12025550100"), "plain")
    assert.equal(linkKind("#faq"), "plain")
    assert.equal(linkKind(""), "plain")
  })
})

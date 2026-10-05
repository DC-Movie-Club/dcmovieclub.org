import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { parseLinkPreview, webUrl } from "./link-preview.ts"

const PAGE = "https://dc.citycast.fm/dc-life-hacks/film-scene"

describe("parseLinkPreview", () => {
  it("reads Open Graph tags and drops the site name from the title", () => {
    const html = `<head>
      <meta property="og:title" content="Your Guide to DC&#x27;s Film Scene · City Cast DC"/>
      <meta property="og:site_name" content="City Cast DC"/>
      <meta property="og:image" content="https://res.cloudinary.com/x/glhil3a1n9?_a=B"/>
    </head>`
    assert.deepEqual(parseLinkPreview(html, PAGE), {
      title: "Your Guide to DC's Film Scene",
      source: "City Cast DC",
      image: "https://res.cloudinary.com/x/glhil3a1n9?_a=B",
    })
  })

  it("reads content before property, single quotes and encoded ampersands", () => {
    const html = `<meta content='https://www.washingtonpost.com/imrs.php?src=a&amp;w=1484' property='og:image' itemProp="image">`
    assert.equal(
      parseLinkPreview(html, PAGE).image,
      "https://www.washingtonpost.com/imrs.php?src=a&w=1484",
    )
  })

  it("prefers the secure image and keeps the first of repeated tags", () => {
    const html = `
      <meta property="og:image" content="http://example.com/a.jpg">
      <meta property="og:image:secure_url" content="https://example.com/a.jpg">
      <meta property="og:title" content="First">
      <meta property="og:title" content="Second">`
    const preview = parseLinkPreview(html, PAGE)
    assert.equal(preview.image, "https://example.com/a.jpg")
    assert.equal(preview.title, "First")
  })

  it("falls back to Twitter tags and the title element", () => {
    assert.deepEqual(
      parseLinkPreview(
        `<title> Movie   night | WJLA </title><meta name="twitter:image" content="/img/still.jpg">`,
        "https://wjla.com/news/local/movie-night",
      ),
      { title: "Movie night | WJLA", source: "", image: "https://wjla.com/img/still.jpg" },
    )
  })

  it("keeps a title that only happens to end with the site name", () => {
    const html = `<meta property="og:site_name" content="Club"><meta property="og:title" content="The Movie Club">`
    assert.equal(parseLinkPreview(html, PAGE).title, "The Movie Club")
  })

  it("leaves out images that aren't web links", () => {
    const html = `<meta property="og:image" content="javascript:alert(1)">`
    assert.equal(parseLinkPreview(html, PAGE).image, "")
  })

  it("returns empty fields for a page without preview tags", () => {
    assert.deepEqual(parseLinkPreview("<p>hello</p>", PAGE), {
      title: "",
      source: "",
      image: "",
    })
  })
})

describe("webUrl", () => {
  it("accepts http and https links only", () => {
    assert.equal(webUrl(" https://wjla.com/a ")?.href, "https://wjla.com/a")
    assert.equal(webUrl("http://wjla.com/")?.href, "http://wjla.com/")
    assert.equal(webUrl("mailto:hello@dcmovieclub.org"), null)
    assert.equal(webUrl("wjla.com/a"), null)
  })
})

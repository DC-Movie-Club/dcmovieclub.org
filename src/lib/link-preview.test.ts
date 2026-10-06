import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { decodeEntities, parseLinkPreview, webUrl } from "./link-preview.ts"

// Head fragments are trimmed from the pages they're named after.

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

  it("ignores extra attributes and the order tags come in (Partiful)", () => {
    const html = `<title data-next-head="">Screening: Muppet Treasure Isl… | Partiful</title>
      <meta property="og:title" content="Screening: Muppet Treasure Island(!) | Partiful" data-sentry-element="meta" data-next-head=""/>
      <meta property="og:image" content="https://partiful.imgix.net/external/user/E/dB?w=1000&amp;h=1000&amp;fit=clip" data-next-head=""/>
      <meta property="og:site_name" content="Partiful" data-sentry-element="meta" data-sentry-source-file="_document.tsx"/>`
    assert.deepEqual(parseLinkPreview(html, "https://partiful.com/e/D2K58DDkt4AvOt6GGHCN"), {
      title: "Screening: Muppet Treasure Island(!)",
      source: "Partiful",
      image: "https://partiful.imgix.net/external/user/E/dB?w=1000&h=1000&fit=clip",
    })
  })

  it("decodes attributes written entirely as entities (Ticket Tailor)", () => {
    const html = `<meta name="twitter:title" content="Buy&#x20;tickets&#x20;&#x2013;&#x20;DC&#x20;Movie&#x20;Club" />
      <meta property="og:title" content="DC&#x20;Movie&#x20;Club" />
      <meta property="og:image" content="https&#x3A;&#x2F;&#x2F;uploads.tickettailorassets.com&#x2F;c_fill,h_600,w_600&#x2F;v1&#x2F;production&#x2F;userfiles&#x2F;mg62r7nji4xttoz39eho.png&#x3F;_a&#x3D;BAAHWXDQ"/>`
    assert.deepEqual(parseLinkPreview(html, "https://www.tickettailor.com/events/dcmovieclub"), {
      title: "DC Movie Club",
      source: "",
      image:
        "https://uploads.tickettailorassets.com/c_fill,h_600,w_600/v1/production/userfiles/mg62r7nji4xttoz39eho.png?_a=BAAHWXDQ",
    })
  })

  it("reads content before property, single quotes and encoded ampersands", () => {
    const html = `<meta content='https://www.washingtonpost.com/imrs.php?src=a&amp;w=1484' property='og:image' itemProp="image">`
    assert.equal(
      parseLinkPreview(html, PAGE).image,
      "https://www.washingtonpost.com/imrs.php?src=a&w=1484",
    )
  })

  it("reads unquoted values and attribute names in any case", () => {
    const html = `<META PROPERTY=og:title Content="Hook Hall - More than a Venue"><meta property=og:site_name content=Hook>`
    const preview = parseLinkPreview(html, "https://www.hookhall.com/")
    assert.equal(preview.title, "Hook Hall - More than a Venue")
    assert.equal(preview.source, "Hook")
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

  it("skips tags with empty content in favor of the next", () => {
    const html = `<meta property="og:title" content=""><meta property="og:title" content="  ">
      <meta name="twitter:title" content="Movie night">`
    assert.equal(parseLinkPreview(html, PAGE).title, "Movie night")
  })

  it("falls back to Twitter tags and the title element", () => {
    assert.deepEqual(
      parseLinkPreview(
        `<title> Movie   night | WJLA </title><meta name="twitter:image" content="/img/still.jpg">`,
        "https://wjla.com/news/local/movie-night",
      ),
      { title: "Movie night | WJLA", source: "", image: "https://wjla.com/img/still.jpg" },
    )
    assert.equal(
      parseLinkPreview(
        "<title>Lower Georgia Avenue &#8211; District Bridges</title>",
        "https://districtbridges.org/main-street/lower-georgia-avenue/",
      ).title,
      "Lower Georgia Avenue – District Bridges",
    )
  })

  it("only drops a site name that follows a separator", () => {
    const titles = {
      "Film Scene | City Cast DC": "Film Scene",
      "Film Scene — City Cast DC": "Film Scene",
      "Film Scene - city cast dc": "Film Scene",
      "Film Scene: City Cast DC": "Film Scene: City Cast DC",
      "Inside City Cast DC": "Inside City Cast DC",
      "City Cast DC": "City Cast DC",
    }
    for (const [title, expected] of Object.entries(titles)) {
      const html = `<meta property="og:site_name" content="City Cast DC"><meta property="og:title" content="${title}">`
      assert.equal(parseLinkPreview(html, PAGE).title, expected, title)
    }
  })

  it("resolves relative and protocol-relative images against the page (AFI Silver)", () => {
    assert.equal(
      parseLinkPreview(
        `<meta property="og:image" content="/wp-content/themes/Sliver/images/AFI-Silver-Marquee-Dusk-w-logo.jpg" />`,
        "https://silver.afi.com/",
      ).image,
      "https://silver.afi.com/wp-content/themes/Sliver/images/AFI-Silver-Marquee-Dusk-w-logo.jpg",
    )
    assert.equal(
      parseLinkPreview(`<meta property="og:image" content="//cdn.example.com/a.jpg">`, PAGE).image,
      "https://cdn.example.com/a.jpg",
    )
  })

  it("leaves out images that aren't web links", () => {
    for (const image of ["javascript:alert(1)", "data:image/png;base64,AAAA", "mailto:hi@example.com"]) {
      const html = `<meta property="og:image" content="${image}">`
      assert.equal(parseLinkPreview(html, PAGE).image, "", image)
    }
  })

  it("returns empty fields for a page without preview tags", () => {
    assert.deepEqual(parseLinkPreview("<p>hello</p>", PAGE), {
      title: "",
      source: "",
      image: "",
    })
  })
})

describe("decodeEntities", () => {
  it("decodes the named entities pages use, in any case", () => {
    assert.equal(
      decodeEntities("Q&amp;A &lt;3 &gt; &quot;hi&quot; it&apos;s&nbsp;on &AMP;"),
      `Q&A <3 > "hi" it's on &`,
    )
  })

  it("decodes decimal and hex numeric entities", () => {
    assert.equal(
      decodeEntities("A &#8211; B &#x27;C&#X27; &#x2F; &#128512;"),
      "A – B 'C' / 😀",
    )
  })

  it("leaves unknown, unterminated and out-of-range entities as written", () => {
    const text = "&hellip; AT&T; Q&A &amp &#xZZ; &#1114112; &#;"
    assert.equal(decodeEntities(text), text)
  })

  it("decodes each entity once", () => {
    assert.equal(decodeEntities("&amp;lt;b&amp;gt;"), "&lt;b&gt;")
  })
})

describe("webUrl", () => {
  it("accepts http and https links, trimming whitespace", () => {
    assert.equal(webUrl(" https://wjla.com/a ")?.href, "https://wjla.com/a")
    assert.equal(webUrl("http://wjla.com/")?.href, "http://wjla.com/")
  })

  it("rejects other schemes and anything that isn't a full URL", () => {
    for (const text of ["mailto:hello@dcmovieclub.org", "javascript:alert(1)", "wjla.com/a", "/events", ""]) {
      assert.equal(webUrl(text), null, text)
    }
  })
})

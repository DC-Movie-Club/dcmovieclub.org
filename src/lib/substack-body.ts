import sanitizeHtml from "sanitize-html"

// Substack widgets that only work on substack.com, or are empty placeholders
// its own scripts fill in
const DROPPED_CLASSES = [
  "subscription-widget-wrap-editor",
  "image-link-expand",
  "poll-embed",
  "native-video-embed",
]

const DROP = { "data-drop": "" }
// Images link to their full-size file; the image alone is enough
const UNWRAP = { "data-unwrap": "" }

function hasClass(attribs: sanitizeHtml.Attributes, names: string[]) {
  const classes = (attribs.class ?? "").split(/\s+/)
  return names.some((name) => classes.includes(name))
}

function galleryImage(attribs: sanitizeHtml.Attributes): string | null {
  try {
    return JSON.parse(attribs["data-attrs"] ?? "").gallery?.staticGalleryImage?.src ?? null
  } catch {
    return null
  }
}

// Removal goes through marker attributes and exclusiveFilter: renaming a tag to
// one that isn't allowed leaves sanitize-html renaming a later closing tag.
export function cleanSubstackBody(html: string): string {
  // exclusiveFilter only lists a tag's direct media children, so a paragraph
  // holding an image inside a link or span would look empty. Instead each
  // paragraph notes how many images and embeds were kept when it opened.
  let mediaKept = 0
  const paragraphStarts: number[] = []

  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "a", "mark",
      "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "hr",
      "div", "figure", "figcaption", "img", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "class", "data-unwrap"],
      div: ["data-drop"],
      img: ["src", "srcset", "sizes", "width", "height", "alt", "loading"],
      iframe: ["src", "allow", "allowfullscreen", "loading"],
    },
    allowedClasses: { a: ["button"] },
    allowedIframeHostnames: ["www.youtube-nocookie.com", "www.youtube.com"],
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "button", "form", "svg"],
    transformTags: {
      h1: "h2",
      h5: "h4",
      h6: "h4",
      div: (tagName, attribs) => {
        if (hasClass(attribs, DROPPED_CLASSES)) return { tagName, attribs: DROP }
        if (hasClass(attribs, ["image-gallery-embed"])) {
          const src = galleryImage(attribs)
          return src
            ? { tagName: "img", attribs: { src, alt: "", loading: "lazy" } }
            : { tagName, attribs: DROP }
        }
        return { tagName, attribs }
      },
      a: (tagName, attribs) => ({
        tagName,
        attribs: hasClass(attribs, ["image-link"]) ? UNWRAP : attribs,
      }),
      p: (tagName, attribs) => {
        paragraphStarts.push(mediaKept)
        return { tagName, attribs }
      },
    },
    exclusiveFilter: (frame) => {
      if (frame.tag === "p") {
        return !frame.text.trim() && mediaKept === paragraphStarts.pop()
      }
      if ("data-drop" in frame.attribs) return true
      if ("data-unwrap" in frame.attribs) return "excludeTag"
      // An embed from a host that isn't allowed loses its src, which would
      // leave a blank box
      if (frame.tag === "iframe" && !frame.attribs.src) return true
      if (frame.tag === "img" || frame.tag === "iframe") mediaKept++
      return false
    },
  })
}

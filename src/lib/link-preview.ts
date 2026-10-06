// What a page offers for link previews, from its Open Graph tags with
// Twitter's tags and <title> as fallbacks. Empty strings for what it lacks.
export type LinkPreview = { title: string; source: string; image: string };

export function webUrl(text: string): URL | null {
  try {
    const url = new URL(text.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== "#") return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    const point =
      code[1].toLowerCase() === "x"
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
    return point <= 0x10ffff ? String.fromCodePoint(point) : match;
  });
}

function clean(text: string) {
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

// Meta tags by their property or name, keeping the first of each
function metaTags(html: string) {
  const tags = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = new Map(
      [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)].map(
        ([, name, double, single, bare]) => [
          name.toLowerCase(),
          double ?? single ?? bare,
        ],
      ),
    );
    const name = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase();
    const content = attrs.get("content");
    if (name && content && !tags.has(name)) tags.set(name, clean(content));
  }
  return tags;
}

const TRAILING_SEPARATOR = /\s+[|·•:–—-]\s*$/;

// Many sites end their titles with their name, like "Headline · City Cast DC"
function withoutSiteName(title: string, site: string) {
  if (!site || !title.toLowerCase().endsWith(site.toLowerCase())) return title;
  const rest = title.slice(0, -site.length);
  return TRAILING_SEPARATOR.test(rest)
    ? rest.replace(TRAILING_SEPARATOR, "").trim()
    : title;
}

export function parseLinkPreview(html: string, pageUrl: string): LinkPreview {
  const tags = metaTags(html);
  const first = (...names: string[]) =>
    names.map((name) => tags.get(name)).find(Boolean) ?? "";

  const source = first("og:site_name");
  const titleTag = /<title\b[^>]*>([^<]*)<\/title>/i.exec(html)?.[1];
  const title = first("og:title", "twitter:title") || clean(titleTag ?? "");
  const image = first(
    "og:image:secure_url",
    "og:image",
    "og:image:url",
    "twitter:image",
    "twitter:image:src",
  );

  // Relative image paths resolve against the page
  const imageUrl =
    image && URL.canParse(image, pageUrl)
      ? (webUrl(new URL(image, pageUrl).href)?.href ?? "")
      : "";

  return { title: withoutSiteName(title, source), source, image: imageUrl };
}

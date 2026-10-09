// Opens every link in a new tab, unless the markup already sets its own
// target or rel
export function withExternalLinks(html: string) {
  return html.replace(/<a\b([^>]*)>/gi, (_match, attrs: string) => {
    const hasTarget = /\btarget\s*=/.test(attrs);
    const hasRel = /\brel\s*=/.test(attrs);
    let out = `<a${attrs}`;
    if (!hasTarget) out += ' target="_blank"';
    if (!hasRel) out += ' rel="noopener noreferrer"';
    out += ">";
    return out;
  });
}

// How a link opens: a page on this site through Next's router, mail, phone
// and in-page anchors (and an empty address) in place, and anywhere else in a
// new tab
export function linkKind(href: string): "internal" | "plain" | "external" {
  if (href.startsWith("/") && !href.startsWith("//")) return "internal";
  if (!href || /^(mailto:|tel:|#)/i.test(href)) return "plain";
  return "external";
}

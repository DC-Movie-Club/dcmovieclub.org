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

// A one-line glimpse of markdown, without its syntax. The editor escapes
// characters like the _ in "DCMC\_25", and those stay as written.
export function plainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\\([\\`*_~])|[*_#<>`]|^\s*[-+]\s|^\s*\d+\.\s/gm, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export type SubstackPost = {
  title: string
  link: string
  description: string | null
  bodyHtml: string | null
  pubDate: string
  // Tagged Events on Substack: ticket announcements, which go stale quickly
  isEvent: boolean
  imageUrl: string | null
  blurDataUrl: string | null
}

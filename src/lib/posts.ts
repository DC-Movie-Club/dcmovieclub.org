import type { SubstackPost } from "@/types/post"

// Event posts are ticket announcements that go stale quickly, so they never
// lead the blog or show on home
export function latestPost(posts: SubstackPost[]): SubstackPost | undefined {
  return posts.find((post) => !post.isEvent)
}

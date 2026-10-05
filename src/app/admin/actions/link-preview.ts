"use server";

import { requireAdmin } from "@/lib/admin-session";
import { parseLinkPreview, webUrl, type LinkPreview } from "@/lib/link-preview";
import { parseYouTubeId, youTubeWatchUrl } from "@/lib/youtube";

// Some sites only send their preview tags to browsers
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const TIMEOUT_MS = 8000;
// Preview tags are in the <head>, so long pages stop being read here
const MAX_BYTES = 1_000_000;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function readHead(res: Response) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (/<\/head>/i.test(html)) break;
  }
  await reader.cancel();
  return html;
}

// A watch page's site name is just "YouTube"; oEmbed names the channel
async function youTubePreview(id: string): Promise<LinkPreview | null> {
  const res = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(youTubeWatchUrl(id))}`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    title: text(data.title),
    source: text(data.author_name),
    image: webUrl(text(data.thumbnail_url))?.href ?? "",
  };
}

// The title, site name and picture a link shows when it's shared, or null when
// the page can't be read
export async function getLinkPreview(url: string): Promise<LinkPreview | null> {
  await requireAdmin();
  const link = webUrl(url);
  if (!link) return null;
  try {
    const youTubeId = parseYouTubeId(link.href);
    if (youTubeId) return await youTubePreview(youTubeId);

    const res = await fetch(link, {
      headers: { "user-agent": USER_AGENT, accept: "text/html" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok || !res.headers.get("content-type")?.includes("html")) {
      await res.body?.cancel();
      return null;
    }
    return parseLinkPreview(await readHead(res), res.url);
  } catch {
    return null;
  }
}

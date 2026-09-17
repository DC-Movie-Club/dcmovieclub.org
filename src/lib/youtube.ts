// Pattern from the Lexical playground's AutoEmbedPlugin, plus a host check and shorts
const YOUTUBE_HOST = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//;
const YOUTUBE_ID = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;

export function parseYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!YOUTUBE_HOST.test(trimmed)) return null;
  const id = YOUTUBE_ID.exec(trimmed)?.[2];
  return id?.length === 11 ? id : null;
}

export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

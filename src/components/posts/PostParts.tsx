import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIME_ZONE } from "@/lib/event-format";
import { SubscribeDialog } from "@/components/posts/SubscribeDialog";
import { Pill } from "@/components/system/Pill";
import { Sticker } from "@/components/system/Sticker";
import { SketchImage } from "@/components/system/SketchImage";
import { textStyles } from "@/components/system/textStyles";
import type { SubstackPost } from "@/types/post";

// "Sep 14", or "Sep 14, 2025" for posts from a previous year.
function formatPostDate(raw: string, now = new Date()) {
  const date = new Date(raw);
  const year = (d: Date) =>
    d.toLocaleDateString("en-US", { year: "numeric", timeZone: TIME_ZONE });
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: year(date) === year(now) ? undefined : "numeric",
    timeZone: TIME_ZONE,
  });
}

// A post's date on a sticker, after `label` if given
export function DatePill({
  pubDate,
  label,
  className,
}: {
  pubDate: string;
  label?: string;
  className?: string;
}) {
  return (
    <Sticker className={cn(textStyles.stickerDate, className)}>
      {label && `${label}: `}
      {formatPostDate(pubDate)}
    </Sticker>
  );
}

// A post's cover across the top of a tile, out to its edges, at Substack's
// cover size. It covers the tile's line there, so the line is drawn again
// over it, turning with the tile's on hover.
export function BleedCover({ post, sizes }: { post: SubstackPost; sizes: string }) {
  if (!post.imageUrl) return null;
  return (
    <SketchImage
      src={post.imageUrl}
      blurDataUrl={post.blurDataUrl}
      sizes={sizes}
      aspect="aspect-[1200/630]"
      radius="rounded-t-xl"
      line="border-[2.5px] border-page-edge transition-colors group-hover/tile:border-page-accent-edge"
      className="self-stretch"
    />
  );
}

// The page's one filled button: getting the next post is what the blog is for
export function SubscribeButton() {
  return (
    <SubscribeDialog
      trigger={
        <Pill variant="accent" size="lg" icon={Mail}>
          Subscribe
        </Pill>
      }
    />
  );
}

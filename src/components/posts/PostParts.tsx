import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIME_ZONE } from "@/lib/event-format";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { Pill } from "@/components/system/Pill";
import { Sticker } from "@/components/system/Sticker";
import { ThumbnailImage } from "@/components/ThumbnailImage";
import { textStyles } from "@/components/textStyles";
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

// A cover across the top of a card, out to its edges, at Substack's cover
// size; other shapes (square logos, wide banners) are shown whole over a blur
// of themselves. It covers the card's line there, so the line is drawn again
// over it. The image takes the same wobble as the line (both from the card's
// corner, with the same noise), so its edge stays under the line wherever it
// moves; a straight edge shows past it or leaves a gap.
export function BleedCover({
  post,
  sizes,
  priority,
  roundedClassName,
  lineClassName,
}: {
  post: SubstackPost;
  sizes: string;
  priority?: boolean;
  roundedClassName: string;
  lineClassName: string;
}) {
  if (!post.imageUrl) return null;
  return (
    <div className="relative self-stretch">
      <ThumbnailImage
        src={post.imageUrl}
        blurDataUrl={post.blurDataUrl}
        sizes={sizes}
        priority={priority}
        fit="contain"
        className={cn("aspect-[1200/630] sketch", roundedClassName)}
      />
      <div
        aria-hidden
        className={cn("absolute inset-0 ink", roundedClassName, lineClassName)}
      />
    </div>
  );
}

// The page's one filled button: getting the next post is what the blog is for
export function SubscribeButton({ className }: { className?: string }) {
  return (
    <SubscribeDialog
      trigger={
        <Pill variant="accent" size="lg" icon={Mail} className={className}>
          Subscribe
        </Pill>
      }
    />
  );
}

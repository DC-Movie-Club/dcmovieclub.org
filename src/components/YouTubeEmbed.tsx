import { cn } from "@/lib/utils";

export function YouTubeEmbed({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "aspect-video w-full overflow-hidden rounded-xl border-2 border-charcoal/15 bg-charcoal",
        className
      )}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        // YouTube refuses to play embeds that send no referrer
        referrerPolicy="strict-origin-when-cross-origin"
        className="size-full"
      />
    </div>
  );
}

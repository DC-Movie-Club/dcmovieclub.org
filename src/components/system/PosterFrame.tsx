import { cn } from "@/lib/utils";
import { LinkOverlay } from "@/components/system/LinkOverlay";
import { SmartLink } from "@/components/system/SmartLink";

// The poster's line, reaching just past the poster
function PosterLine({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-[2px] rounded-lg border-[3px] border-charcoal ink",
        className,
      )}
    />
  );
}

// A film poster in a hand-drawn frame, linking to `href`. It tilts, grows and
// boils on hover, with a wash over the poster captioned `caption`. `badge`
// (stickers) sits over the frame.
export function PosterFrame({
  href,
  caption,
  badge,
  children,
}: {
  href: string;
  caption: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SmartLink
      href={href}
      className="group/poster relative block w-full rounded-lg transition-transform hover:-rotate-1 hover:scale-105 focus-ring [--focus-offset:4px]"
    >
      {/* A filled twin of the line, wobbling identically, so the ink filter
          never opens a gap to the page between poster and line. It's all one
          color, so it takes ink without smearing. */}
      <PosterLine className="bg-charcoal parent-hover:boil-sm" />
      <div className="relative aspect-poster w-full overflow-hidden rounded-[7px]">
        {children}
        <LinkOverlay caption={caption} className="group-hover/poster:opacity-100" />
      </div>
      <PosterLine className="parent-hover:boil-sm" />
      {badge}
    </SmartLink>
  );
}

// A cream card the size of a poster, beside the posters. Its content is
// clipped to it.
export function PosterCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute -inset-[2px] rounded-lg bg-cream sketch" />
      <div className={cn("absolute inset-0 overflow-hidden rounded-[7px]", className)}>
        {children}
      </div>
    </div>
  );
}

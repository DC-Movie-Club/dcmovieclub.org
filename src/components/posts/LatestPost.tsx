import { cn } from "@/lib/utils";
import { CardSurface } from "@/components/CardSurface";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { proseHtml } from "@/components/markdownStyles";
import { textStyles } from "@/components/textStyles";
import { DatePill } from "@/components/posts/PostParts";
import { ThumbnailImage } from "@/components/ThumbnailImage";
import type { SubstackPost } from "@/types/post";
import { SmartLink } from "@/components/system/SmartLink";

// About 70 characters of body text a line: all caps tire the eye over the
// card's full width
const ARTICLE_COLUMN = "mx-auto w-full max-w-[32rem]";

// Substack is still a link away, for comments and likes
function OpenOnSubstack({ post }: { post: SubstackPost }) {
  return (
    <p className="mt-8 text-center text-base">
      <SmartLink
        href={post.link}
        className={textStyles.proseLink}
      >
        Open on Substack
      </SmartLink>
    </p>
  );
}

// A copy of the cover, framed like a photo and set over the card's top edge:
// across the card on phones, small in the top-left corner on wider screens.
// The image takes the frame's wobble, so its edge stays under the frame's line.
function CoverSnapshot({
  post,
  priority,
}: {
  post: SubstackPost;
  priority?: boolean;
}) {
  if (!post.imageUrl) return null;
  return (
    <div className="relative -mt-6 w-full shrink-0 rounded-lg shadow-lg sm:-mt-8 sm:w-[22rem]">
      <ThumbnailImage
        src={post.imageUrl}
        blurDataUrl={post.blurDataUrl}
        sizes="(min-width: 640px) 352px, 100vw"
        priority={priority}
        fit="contain"
        className="aspect-[1200/630] rounded-lg sketch-subtle"
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-lg border-[2.5px] border-charcoal sketch-subtle"
      />
    </div>
  );
}

// The newest post that isn't a ticket announcement, leading the blog and in
// home's newsletter band: a small cover beside its title, and the post read in
// full in place
export function LatestPost({
  post,
  priority,
}: {
  post: SubstackPost;
  priority?: boolean;
}) {
  return (
    <article className="relative flex flex-col">
      <CardSurface />

      {/* The subtitle's last line sits level with the cover's bottom edge */}
      <div className="relative flex flex-col gap-4 px-5 sm:flex-row sm:items-end sm:gap-6 sm:px-6">
        <CoverSnapshot post={post} priority={priority} />
        <div
          className={cn(
            "flex min-w-0 flex-col items-start gap-2",
            !post.imageUrl && "pt-6",
          )}
        >
          <DatePill pubDate={post.pubDate} label="Latest" />
          <h2 className={textStyles.cardTitle}>{post.title}</h2>
          {post.description && (
            <p className={textStyles.cardDek}>{post.description}</p>
          )}
        </div>
      </div>

      {post.bodyHtml ? (
        <ExpandableDescription
          html={post.bodyHtml}
          // The clipping wrapper gets a gutter so button shadows and hover
          // growth aren't cut off at the sides
          className={cn(
            "relative px-5 pt-5 pb-10 sm:px-6 sm:pt-10 sm:pb-12 [&>div:first-child]:-mx-3 [&>div:first-child]:px-3",
            textStyles.proseBody,
          )}
          htmlClassName={cn(proseHtml, ARTICLE_COLUMN)}
          collapsedClassName="max-h-[4lh]"
          actionClassName="absolute bottom-0 left-1/2 mt-0 -translate-x-1/2 translate-y-1/2"
        >
          <OpenOnSubstack post={post} />
        </ExpandableDescription>
      ) : (
        <div className="relative px-5 pb-8 sm:px-6">
          <OpenOnSubstack post={post} />
        </div>
      )}
    </article>
  );
}

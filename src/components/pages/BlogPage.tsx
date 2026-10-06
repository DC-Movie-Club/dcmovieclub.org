import { ArrowUpRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIME_ZONE } from "@/lib/event-format";
import type { PageView } from "@/lib/pages";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { CardSurface } from "@/components/CardSurface";
import { SectionCard } from "@/components/section-cards";
import { CreamCard } from "@/components/CreamCard";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import {
  SubscribeDialog,
  SubstackSignup,
} from "@/components/SubscribeDialog";
import type { SubstackPost } from "@/types/post";
import { ThumbnailImage } from "@/components/ThumbnailImage";

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

// Matches the date stickers on the Letterboxd posters.
function DatePill({
  pubDate,
  label,
  className,
}: {
  pubDate: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex w-fit items-center whitespace-nowrap px-3 py-1.5 text-sm uppercase leading-none tracking-wider text-charcoal/70",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-charcoal/25 bg-cream shadow-md sketch-subtle"
      />
      <span className="relative">
        {label && `${label}: `}
        {formatPostDate(pubDate)}
      </span>
    </span>
  );
}

function OpensOverlay({
  className,
  washClassName,
}: {
  className: string;
  washClassName: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-page-accent-edge/80", washClassName)} />
      <ArrowUpRight
        size={32}
        strokeWidth={2.5}
        className="relative text-cream sketch"
      />
    </div>
  );
}

// Substack's HTML, cleaned on the server, in the card's ink
const POST_BODY = cn(
  "[&>:first-child]:mt-0 [&_p]:mt-4 [&_li>p]:mt-0",
  "[&_h2]:mt-10 [&_h2]:text-[1.75rem] [&_h2]:tracking-wider [&_h2]:text-charcoal",
  "[&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:tracking-wider [&_h3]:text-charcoal",
  "[&_h4]:mt-6 [&_h4]:text-xl [&_h4]:tracking-wider [&_h4]:text-charcoal",
  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1 [&_li::marker]:text-rust",
  "[&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-rust/40 [&_blockquote]:pl-4 [&_blockquote>:first-child]:mt-0",
  "[&_hr]:my-8 [&_hr]:border-t-2 [&_hr]:border-charcoal/20",
  "[&_a]:text-rust [&_a]:underline [&_a]:decoration-rust/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-rust",
  "[&_a.button]:mt-1 [&_a.button]:inline-flex [&_a.button]:rounded-full [&_a.button]:border-2 [&_a.button]:border-page-accent-edge [&_a.button]:bg-page-accent [&_a.button]:px-4 [&_a.button]:py-1.5 [&_a.button]:text-base [&_a.button]:tracking-wider [&_a.button]:text-page-accent-text [&_a.button]:no-underline [&_a.button]:shadow-md [&_a.button]:transition-transform [&_a.button:hover]:scale-105",
  "[&_figure]:mt-5 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg [&_img]:border-2 [&_img]:border-charcoal",
  "[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-charcoal/60",
  "[&_iframe]:mt-5 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-lg",
  "[&_mark]:bg-page-accent/25 [&_mark]:text-inherit",
);

// About 70 characters of body text a line: all caps tire the eye over the
// card's full width
const ARTICLE_COLUMN = "mx-auto w-full max-w-[32rem]";

// A cover across the top of a card, out to its edges, at Substack's cover
// size; other shapes (square logos, wide banners) are shown whole over a blur
// of themselves. It covers the card's line there, so the line is drawn again
// over it. The image takes the same wobble as the line (both from the card's
// corner, with the same noise), so its edge stays under the line wherever it
// moves; a straight edge shows past it or leaves a gap.
function BleedCover({
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
function SubscribeButton({ className }: { className?: string }) {
  return (
    <SubscribeDialog
      trigger={
        <button
          type="button"
          className={cn(
            "group/subscribe relative rounded-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream",
            className,
          )}
        />
      }
    >
      <span
        aria-hidden
        className="absolute inset-px rounded-full bg-page-accent shadow-lg sketch group-hover/subscribe:boil"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-[3px] border-page-accent-edge ink group-hover/subscribe:boil"
      />
      <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider whitespace-nowrap text-page-accent-text sm:text-base">
        <Mail size={18} className="shrink-0" />
        Subscribe
      </span>
    </SubscribeDialog>
  );
}

// Substack is still a link away, for comments and likes
function OpenOnSubstack({ post }: { post: SubstackPost }) {
  return (
    <p className="mt-8 text-center text-base">
      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-rust underline decoration-rust/40 underline-offset-4 hover:decoration-rust"
      >
        Open on Substack
      </a>
    </p>
  );
}

function LatestPost({ post }: { post: SubstackPost }) {
  return (
    <article className="relative flex flex-col items-start">
      <CardSurface />
      <DatePill
        pubDate={post.pubDate}
        label="Latest"
        className="absolute -top-3.5 left-4 z-10 sm:left-6"
      />

      <BleedCover
        post={post}
        sizes="(min-width: 768px) 768px, 100vw"
        priority
        roundedClassName="rounded-t-2xl"
        lineClassName="border-[3px] border-page-edge"
      />

      <div
        className={cn(
          "relative flex flex-col gap-2 self-stretch px-5 pt-5 sm:px-6 sm:pt-6",
          !post.imageUrl && "pt-8 sm:pt-9",
        )}
      >
        <h2
          className={cn(
            "text-3xl uppercase leading-tight tracking-wide text-charcoal sm:text-4xl",
            ARTICLE_COLUMN,
          )}
        >
          {post.title}
        </h2>
        {post.description && (
          <p className={cn("text-lg text-charcoal/70", ARTICLE_COLUMN)}>
            {post.description}
          </p>
        )}
      </div>

      {post.bodyHtml ? (
        <ExpandableDescription
          html={post.bodyHtml}
          // The clipping wrapper gets a gutter so button shadows and hover
          // growth aren't cut off at the sides
          className="relative self-stretch px-5 pt-6 pb-10 text-base leading-[1.6] tracking-[0.04em] text-charcoal/90 sm:px-6 sm:pb-12 [&>div:first-child]:-mx-3 [&>div:first-child]:px-3"
          htmlClassName={cn(POST_BODY, ARTICLE_COLUMN)}
          collapsedClassName="max-h-[8lh]"
          actionClassName="absolute bottom-0 left-1/2 mt-0 -translate-x-1/2 translate-y-1/2"
        >
          <OpenOnSubstack post={post} />
        </ExpandableDescription>
      ) : (
        <div className="relative self-stretch px-5 pb-8 sm:px-6">
          <OpenOnSubstack post={post} />
        </div>
      )}
    </article>
  );
}

function PostTile({ post }: { post: SubstackPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group/tile relative flex h-full flex-col rounded-xl transition-transform hover:-rotate-1 hover:scale-102 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
    >
      <div
        aria-hidden
        className="absolute inset-px rounded-xl bg-cream sketch"
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl border-[2.5px] border-page-edge transition-colors ink group-hover/tile:border-page-accent-edge"
      />
      <BleedCover
        post={post}
        sizes="(min-width: 640px) 380px, 100vw"
        roundedClassName="rounded-t-xl"
        lineClassName="border-[2.5px] border-page-edge transition-colors group-hover/tile:border-page-accent-edge"
      />
      <div
        className={cn(
          "relative flex min-w-0 flex-col gap-1.5 px-4 pt-3 pb-4",
          !post.imageUrl && "pt-7",
        )}
      >
        <h3 className="line-clamp-3 text-lg uppercase leading-tight tracking-wide text-charcoal sm:text-xl">
          {post.title}
        </h3>
        {post.description && (
          <p className="line-clamp-2 text-sm text-charcoal/75">
            {post.description}
          </p>
        )}
      </div>
      <OpensOverlay
        className="group-hover/tile:opacity-100"
        washClassName="inset-px rounded-xl sketch"
      />
      <DatePill pubDate={post.pubDate} className="absolute -top-3.5 left-4" />
    </a>
  );
}

function Posts({ posts }: { posts: SubstackPost[] }) {
  if (posts.length === 0) {
    return (
      <CreamCard>
        <p className="text-center text-lg uppercase tracking-wide text-charcoal/80">
          No posts yet. Check back soon!
        </p>
      </CreamCard>
    );
  }

  // Event posts are ticket announcements that go stale quickly, so they never
  // lead the page
  const latest = posts.find((post) => !post.isEvent);
  const more = posts.filter((post) => post !== latest);

  return (
    <>
      {latest && <LatestPost post={latest} />}

      {/* Substack fits its form to the frame's height: at this one it drops
          its logo and tagline, and the margins pull the leftover space at its
          top and bottom into the card's padding */}
      <SectionCard label="Subscribe">
        <SubstackSignup className="mx-auto -mt-6 -mb-4 h-[230px] max-w-md" />
      </SectionCard>

      {more.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl uppercase tracking-wide text-page-fg sm:text-2xl">
            Older posts
          </h2>
          <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2">
            {more.map((post) => (
              <li key={post.link}>
                <PostTile post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function BlogHeader({ page }: { page: PageView }) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <PageTitle>{page.title}</PageTitle>
        {page.subtitle && (
          <p className="text-xl uppercase tracking-wide text-page-fg">
            {page.subtitle}
          </p>
        )}
      </div>
      <SubscribeButton className="self-start sm:self-auto" />
    </header>
  );
}

export function BlogPage({
  page,
  posts,
}: {
  page: PageView;
  posts: SubstackPost[];
}) {
  return (
    <ColorPage
      colors={page.colors}
      header={<BlogHeader page={page} />}
      contentClassName="mt-14"
    >
      <Posts posts={posts} />
    </ColorPage>
  );
}

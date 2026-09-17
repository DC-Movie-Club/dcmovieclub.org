import { ArrowUpRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecentPosts } from "@/lib/data";
import { TIME_ZONE } from "@/lib/event-format";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { CardSurface } from "@/components/CardSurface";
import { CreamCard } from "@/components/CreamCard";
import type { SubstackPost } from "@/types/post";
import { ThumbnailImage } from "./ThumbnailImage";

const SUBSTACK_URL = "https://dcmovieclub.substack.com";

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
  className,
}: {
  pubDate: string;
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
      <span className="relative">{formatPostDate(pubDate)}</span>
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
      <div className={cn("absolute inset-0 bg-rose-dark/80", washClassName)} />
      <ArrowUpRight
        size={32}
        strokeWidth={2.5}
        className="relative text-cream sketch"
      />
    </div>
  );
}

function LatestPostCard({ post }: { post: SubstackPost }) {
  return (
    <div className="group/card relative">
      <CardSurface className="card-hover:stroke-rose-dark" />

      {/* Stretched link makes the whole card clickable; the pill below is the
          focusable CTA, so this one stays out of the tab order. */}
      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
        className="absolute inset-0 rounded-2xl"
      />

      <div className="pointer-events-none absolute -top-5 left-6 z-10 -rotate-4 sm:-top-6 sm:left-8">
        <span className="font-dcmc text-4xl uppercase leading-none tracking-wide text-cream outlined-lettering outline-ink-page-ink card-hover:outline-ink-rose-dark sm:text-5xl">
          Latest
        </span>
      </div>

      <div className="pointer-events-none relative flex flex-col gap-5 px-5 pt-12 pb-6 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:pt-14 sm:pb-7">
        {post.imageUrl ? (
          <div className="relative mt-2 shrink-0 sm:mt-0 sm:w-2/5">
            <ThumbnailImage
              src={post.imageUrl}
              blurDataUrl={post.blurDataUrl}
              sizes="(min-width: 640px) 300px, 100vw"
              priority
              className="aspect-wide rounded-lg"
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-lg border-[2.5px] border-charcoal sketch-subtle"
            />
            <DatePill
              pubDate={post.pubDate}
              className="absolute -top-3.5 -left-2"
            />
          </div>
        ) : (
          <DatePill pubDate={post.pubDate} />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-2xl uppercase leading-tight tracking-wide text-charcoal sm:text-3xl">
            {post.title}
          </h2>
          {post.description && (
            <p className="text-charcoal/85">{post.description}</p>
          )}
        </div>
      </div>

      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-0 right-4 z-10 block -translate-y-1/2 rounded-full transition-transform card-hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-6"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-[3px] border-rose-dark bg-rose shadow-lg sketch card-hover:sketch-animated"
        />
        <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-rose-dark sm:px-6 sm:py-3 sm:text-base">
          <span className="sm:hidden">Read</span>
          <span className="hidden sm:inline">Read on Substack</span>
          <ArrowUpRight size={18} className="shrink-0" />
        </span>
      </a>
    </div>
  );
}

function PostTile({ post }: { post: SubstackPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group/tile relative block h-full rounded-xl transition-transform hover:-rotate-1 hover:scale-102 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl border-[2.5px] border-page-edge bg-cream transition-colors sketch group-hover/tile:border-rose-dark"
      />
      <div
        className={cn(
          "relative grid items-center gap-4 px-3 pt-5 pb-3 sm:flex sm:h-full sm:flex-col sm:items-stretch sm:gap-3",
          post.imageUrl && "grid-cols-[auto_1fr]",
        )}
      >
        {post.imageUrl && (
          <ThumbnailImage
            src={post.imageUrl}
            blurDataUrl={post.blurDataUrl}
            sizes="(min-width: 640px) 240px, 80px"
            className="aspect-square w-20 rounded-md sm:aspect-wide sm:w-full"
          />
        )}
        <div className="flex min-w-0 flex-col gap-1.5 sm:px-1 sm:pb-1">
          <h3 className="line-clamp-2 text-base uppercase leading-tight tracking-wide text-charcoal sm:line-clamp-3 sm:text-lg">
            {post.title}
          </h3>
          {post.description && (
            <p className="line-clamp-2 text-sm text-charcoal/75">
              {post.description}
            </p>
          )}
        </div>
      </div>
      <OpensOverlay
        className="group-hover/tile:opacity-100"
        washClassName="rounded-xl sketch"
      />
      <DatePill pubDate={post.pubDate} className="absolute -top-3.5 left-4" />
    </a>
  );
}

export default async function Blog() {
  const posts = await getRecentPosts();
  const [latest, ...older] = posts;

  return (
    <ColorPage className="bg-charcoal page-ink-rose page-edge-charcoal-light">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4">
          <PageTitle>Blog</PageTitle>
          <p className="text-xl uppercase tracking-wide text-cream">
            Updates and interviews from our newsletter
          </p>
        </div>
        <a
          href={SUBSTACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group/subscribe relative self-start rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:self-auto"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-cream transition-colors sketch-subtle group-hover/subscribe:bg-cream group-hover/subscribe:sketch-subtle-animated"
          />
          <span className="relative flex items-center gap-2 px-4 py-2 text-sm uppercase tracking-widest text-cream transition-colors group-hover/subscribe:text-charcoal">
            <Mail size={14} />
            Subscribe
          </span>
        </a>
      </header>

      {latest ? (
        <LatestPostCard post={latest} />
      ) : (
        <CreamCard>
          <p className="text-center text-lg uppercase tracking-wide text-charcoal/80">
            No posts yet. Check back soon!
          </p>
        </CreamCard>
      )}

      {older.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl uppercase tracking-wide text-cream sm:text-2xl">
            Older posts
          </h2>
          <ul className="grid gap-x-4 gap-y-6 sm:grid-cols-3">
            {older.map((post) => (
              <li key={post.link}>
                <PostTile post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </ColorPage>
  );
}

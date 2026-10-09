"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Heart, Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";
import { Letterboxd } from "@/components/icons/Letterboxd";
import type { LetterboxdReview } from "@/types/letterboxd";
import { SmartLink } from "@/components/system/SmartLink";

const POSTER_COUNT = 3;
const SHORT_REVIEW_CHARS = 60;
const LETTERBOXD_PROFILE_URL = "https://letterboxd.com/DCMovieClub/";

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = rating - i;
        return (
          <span key={i} className="relative">
            <Star
              size={size}
              className={cn(
                "fill-current",
                fill < 1 && "text-charcoal/20",
              )}
            />
            {fill >= 0.5 && fill < 1 && (
              <StarHalf size={size} className="absolute inset-0 fill-current" />
            )}
          </span>
        );
      })}
    </div>
  );
}

function SketchOutline({ className }: { className?: string }) {
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

function TileLink({
  href,
  children,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <SmartLink
      href={href}
      className="group/card relative block w-full rounded-lg transition-transform hover:-rotate-1 hover:scale-105 focus-ring focus-ring-rust [--focus-offset:4px]"
    >
      {/* A filled twin of the outline, wobbling identically, so the ink
          filter never opens a gap to the page between poster and border. It's
          all one color, so it takes ink without smearing. */}
      <SketchOutline className="bg-charcoal group-hover/card:boil-sm" />
      <div className="relative aspect-poster w-full overflow-hidden rounded-[7px]">
        {children}
      </div>
      <SketchOutline className="group-hover/card:boil-sm" />
      {badge}
    </SmartLink>
  );
}

function PosterSticker({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute flex items-center whitespace-nowrap",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-charcoal/25 bg-cream shadow-md sketch-subtle"
      />
      <div className="relative flex items-center gap-1.5">{children}</div>
    </div>
  );
}

const HEART_STICKER = { size: 36, radius: 16, fold: 0.74, peelAngle: 45 };

// A round sticker with one edge peeled back. The cut-off segment of the circle
// is mirrored across the fold line to draw the flap; the whole peel is rotated
// so it lifts from the bottom-right.
function HeartSticker({ className }: { className?: string }) {
  const id = useId();
  const { size, radius, fold, peelAngle } = HEART_STICKER;
  const center = size / 2;
  const foldX = center + radius * fold;
  const flapCenter = 2 * foldX - center;
  const peelTransform = `rotate(${peelAngle} ${center} ${center})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Liked"
      className={cn("-rotate-12 overflow-visible drop-shadow-md", className)}
    >
      <defs>
        <clipPath id={`${id}-front`}>
          <rect width={foldX} height={size} />
        </clipPath>
        <linearGradient
          id={`${id}-flap`}
          gradientUnits="userSpaceOnUse"
          x1={foldX}
          x2={flapCenter - radius}
        >
          <stop offset="0" stopColor="#d6cfb9" />
          <stop offset="1" stopColor="#fbf9f1" />
        </linearGradient>
      </defs>
      <g transform={peelTransform}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          clipPath={`url(#${id}-front)`}
          className="fill-rust stroke-cream/60"
          strokeWidth={2}
        />
      </g>
      <Heart
        size={14}
        x={center - 7}
        y={center - 7}
        className="fill-cream text-cream"
      />
      <g
        transform={peelTransform}
        className="drop-shadow-[-1px_0_1px_rgb(0_0_0/0.3)]"
      >
        <circle
          cx={flapCenter}
          cy={center}
          r={radius}
          fill={`url(#${id}-flap)`}
          clipPath={`url(#${id}-front)`}
        />
      </g>
    </svg>
  );
}

function formatDiaryDate(date: string) {
  // Diary dates are bare "YYYY-MM-DD" strings that parse as UTC midnight.
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function FilmPoster({
  review,
  showRating,
}: {
  review: LetterboxdReview;
  showRating: boolean;
}) {
  const badges = (
    <>
      {review.diaryDate && (
        <PosterSticker className="-top-3.5 left-1/2 -translate-x-1/2 px-3 py-1.5 text-sm uppercase leading-none tracking-wider text-charcoal/70">
          {formatDiaryDate(review.diaryDate)}
        </PosterSticker>
      )}
      {showRating && review.rating !== null && (
        <PosterSticker className="-bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 text-rust">
          <StarRating rating={review.rating} />
        </PosterSticker>
      )}
      {review.liked && (
        <HeartSticker className="absolute -top-2 -left-2" />
      )}
    </>
  );

  return (
    <TileLink href={review.url} badge={badges}>
      {review.posterUrl ? (
        <img
          src={review.posterUrl}
          alt={review.filmTitle}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted p-2 text-center text-xs text-muted-foreground">
          {review.filmTitle}
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#5c1a06]/85 p-3 text-center opacity-0 transition-opacity group-hover/card:opacity-100">
        <ArrowUpRight size={32} className="text-white sketch" strokeWidth={2.5} />
        <span className="text-sm uppercase leading-tight tracking-wide text-white">
          {review.filmTitle}
        </span>
      </div>
    </TileLink>
  );
}

// A card beside the featured poster. The card is absolutely positioned so the
// text never stretches the row; overflow is clipped and faded out.
function FeaturedReviewCard({ review }: { review: LetterboxdReview }) {
  const clipRef = useRef<HTMLParagraphElement>(null);
  const [isClipped, setIsClipped] = useState(false);
  const text = review.review ?? "";
  const isShort = text.length <= SHORT_REVIEW_CHARS;

  useLayoutEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;

    const measure = () => setIsClipped(clip.scrollHeight > clip.clientHeight);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(clip);
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative xs:col-span-2">
      <div className="absolute inset-0">
        <div
          aria-hidden
          className="absolute -inset-[2px] rounded-lg bg-cream sketch"
        />
        <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden rounded-[7px] p-4 text-charcoal">
          {review.rating !== null && (
            <div className="shrink-0 text-rust">
              <StarRating rating={review.rating} size={14} />
            </div>
          )}
          <p
            ref={clipRef}
            className={cn(
              "min-h-0 flex-1 overflow-hidden",
              isShort ? "text-2xl leading-tight" : "text-sm leading-normal",
              isClipped && "mask-b-from-[calc(100%-2rem)]",
            )}
          >
            {text}
          </p>
          {review.reviewer && (
            <p className="shrink-0 text-xs tracking-wide text-charcoal/55">
              — {review.reviewer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FollowButton() {
  return (
    <SmartLink
      href={LETTERBOXD_PROFILE_URL}
      aria-label="Follow us on Letterboxd"
      className="group/follow relative block w-fit shrink-0 rounded-full transition-transform hover:scale-105 focus-ring focus-ring-rust"
    >
      <span
        aria-hidden
        className="absolute inset-px rounded-full transition-colors sketch group-hover/follow:bg-charcoal group-hover/follow:boil"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-[3px] border-charcoal ink group-hover/follow:boil"
      />
      <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-charcoal transition-colors group-hover/follow:text-cream">
        <Letterboxd size={20} />
        Follow us
        <ArrowUpRight size={16} />
      </span>
    </SmartLink>
  );
}

export function RecentlyWatchedRail({
  reviews,
}: {
  reviews: LetterboxdReview[];
}) {
  const featured = reviews.find((review) => review.review);
  const posters = reviews
    .filter((review) => review !== featured)
    .slice(0, POSTER_COUNT);

  return (
    <section className="px-6 pb-2">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h2 className="text-xl uppercase tracking-wide text-charcoal sm:text-2xl">
            What we&apos;ve been watching
          </h2>
          <FollowButton />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 xs:grid-cols-3 md:grid-cols-6">
          {featured && (
            <>
              <FilmPoster review={featured} showRating={false} />
              <FeaturedReviewCard review={featured} />
            </>
          )}
          {posters.map((review, i) => (
            // Phones fit two posters under the featured row
            <div key={review.id} className={cn(i >= 2 && "max-xs:hidden")}>
              <FilmPoster review={review} showRating />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

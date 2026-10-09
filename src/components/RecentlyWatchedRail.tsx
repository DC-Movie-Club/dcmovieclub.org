"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Heart, Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";
import { socials } from "@/config/navigation";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Pill } from "@/components/system/Pill";
import { PosterCard, PosterFrame } from "@/components/system/PosterFrame";
import { Sticker } from "@/components/system/Sticker";
import { textStyles } from "@/components/textStyles";
import type { LetterboxdReview } from "@/types/letterboxd";

const POSTER_COUNT = 3;
const SHORT_REVIEW_CHARS = 60;

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
        <Sticker
          className={cn("absolute -top-3.5 left-1/2 -translate-x-1/2", textStyles.stickerDate)}
        >
          {formatDiaryDate(review.diaryDate)}
        </Sticker>
      )}
      {showRating && review.rating !== null && (
        <Sticker className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-rust">
          <StarRating rating={review.rating} />
        </Sticker>
      )}
      {review.liked && (
        <HeartSticker className="absolute -top-2 -left-2" />
      )}
    </>
  );

  return (
    <PosterFrame href={review.url} caption={review.filmTitle} badge={badges}>
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
    </PosterFrame>
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
      <PosterCard className="flex flex-col gap-3 p-4 text-charcoal">
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
      </PosterCard>
    </div>
  );
}

function FollowButton() {
  const { letterboxd } = socials;
  return (
    <Pill
      variant="outline"
      href={letterboxd.href}
      icon={letterboxd.icon}
      iconEnd={ArrowUpRight}
      aria-label="Follow us on Letterboxd"
    >
      Follow us
    </Pill>
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
    <Container as="section" className="pb-2">
      <SectionHeader title="What we've been watching" action={<FollowButton />} />

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
    </Container>
  );
}

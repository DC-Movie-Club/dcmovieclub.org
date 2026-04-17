"use client";

import { useState } from "react";
import { ArrowUpRight, Heart, Star, StarHalf, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "@/components/ui/link";
import { Letterboxd } from "@/components/icons/Letterboxd";
import { ParagraphLong } from "@/components/icons/ParagraphLong";
import { ParagraphShort } from "@/components/icons/ParagraphShort";
import type { LetterboxdReview } from "@/types/letterboxd";

function StarRating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < full; i++) {
    stars.push(<Star key={`f${i}`} size={12} className="fill-current" />);
  }
  if (half) {
    stars.push(<StarHalf key="half" size={12} className="fill-current" />);
  }
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5`}
    >
      {stars}
    </div>
  );
}

function FilmCard({
  review,
  isSelected,
  onToggle,
}: {
  review: LetterboxdReview;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const hasReview = !!review.review;
  const reviewIcon = hasReview
    ? review.review!.length < 300
      ? <ParagraphShort size={14} />
      : <ParagraphLong size={14} />
    : null;

  const cardInner = (
    <>
      <div
        aria-hidden
        className="absolute -inset-[2px] rounded-lg border-[3px] border-charcoal sketch group-hover/card:sketch-animated"
      />
      <div className="relative overflow-hidden rounded-[7px]">
        {review.posterUrl ? (
          <img
            src={review.posterUrl}
            alt={review.filmTitle}
            className="aspect-poster w-full object-cover"
          />
        ) : (
          <div className="flex aspect-poster w-full items-center justify-center bg-muted p-2 text-center text-xs text-muted-foreground">
            {review.filmTitle}
          </div>
        )}
        {!hasReview && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#5c1a06]/85 opacity-0 transition-opacity group-hover/card:opacity-100">
            <ArrowUpRight size={36} className="text-white sketch" strokeWidth={2.5} />
          </div>
        )}
      </div>
      {reviewIcon && (
        <div className="absolute -right-1.5 -bottom-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-charcoal bg-cream text-charcoal shadow-sm sketch">
          {reviewIcon}
        </div>
      )}
    </>
  );

  const cardClass = cn(
    "group/card relative block w-full transition-transform",
    isSelected ? "-rotate-1 scale-105" : "hover:-rotate-1 hover:scale-105",
  );

  return (
    <div className="flex w-[110px] flex-none flex-col sm:w-[130px]">
      {hasReview ? (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isSelected}
          className={cn(cardClass, "cursor-pointer text-left")}
        >
          {cardInner}
        </button>
      ) : (
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
        >
          {cardInner}
        </a>
      )}

      <div className="mt-3 flex flex-col gap-1 px-0.5">
        <h3
          className="line-clamp-2 text-xs uppercase leading-snug tracking-wide text-charcoal"
          title={review.filmTitle}
        >
          {review.filmTitle}
        </h3>
        <div className="flex items-center gap-1.5 text-rust">
          {review.rating !== null && <StarRating rating={review.rating} />}
          {review.liked && <Heart size={12} className="fill-current" />}
        </div>
      </div>
    </div>
  );
}

function ReviewPanel({
  review,
  onClose,
}: {
  review: LetterboxdReview;
  onClose: () => void;
}) {
  return (
    <div className="relative mt-5">
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl border-[3px] border-charcoal bg-cream sketch"
      />
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6 sm:pr-12">
        {review.posterUrl && (
          <img
            src={review.posterUrl}
            alt=""
            aria-hidden
            className="aspect-poster w-20 shrink-0 self-start rounded-md object-cover shadow-md sm:w-24"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-xl uppercase leading-tight tracking-wide text-charcoal sm:text-2xl">
              {review.filmTitle}
              {review.filmYear && (
                <span className="ml-2 text-base text-charcoal/50">
                  {review.filmYear}
                </span>
              )}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-2 text-rust">
            {review.rating !== null && <StarRating rating={review.rating} />}
            {review.liked && <Heart size={14} className="fill-current" />}
          </div>
          {review.review && (
            <div
              className="mt-3 text-sm leading-relaxed text-charcoal/85 [&_a]:text-rust [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: review.review }}
            />
          )}
          <ExternalLink
            href={review.url}
            className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-rust hover:sketch-subtle-animated"
          >
            <Letterboxd size={12} />
            Read on Letterboxd
          </ExternalLink>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close review"
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:bg-charcoal/5 hover:text-charcoal hover:sketch-subtle-animated"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export function RecentlyWatchedRail({
  reviews,
}: {
  reviews: LetterboxdReview[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = reviews.find((r) => r.id === selectedId && r.review);

  return (
    <section className="pb-2">
      <div className="mx-auto max-w-3xl">
        <div className="relative mx-6">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-charcoal sketch"
          />
          <h2 className="relative mx-auto w-fit bg-background px-5 text-center text-xl uppercase leading-none tracking-wide text-charcoal sm:text-2xl">
            What we've been watching
          </h2>
        </div>

        <div className="mt-6 flex gap-4 overflow-x-auto px-1 pt-3 pb-4 sm:gap-5 px-6">
          {reviews.map((review) => (
            <FilmCard
              key={review.id}
              review={review}
              isSelected={review.id === selectedId}
              onToggle={() =>
                setSelectedId((prev) => (prev === review.id ? null : review.id))
              }
            />
          ))}
        </div>

        {selected && (
          <div className="px-6">
            <ReviewPanel
              review={selected}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}

        <div className="mt-5 flex justify-end px-6">
          <ExternalLink
            href="https://letterboxd.com/dcmovieclub/diary/"
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground"
          >
            <Letterboxd size={12} />
            See more on Letterboxd
          </ExternalLink>
        </div>
      </div>
    </section>
  );
}

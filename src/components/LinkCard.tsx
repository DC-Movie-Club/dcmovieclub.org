"use client";

import { useState } from "react";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardItem } from "@/lib/pages";

// A link with its site's preview picture, like a press piece. The picture is
// loaded from that site, so if it's gone the card shows without it.
export function LinkCard({ item }: { item: CardItem }) {
  // The picture address that failed, so a new one gets its own try
  const [broken, setBroken] = useState("");
  const image = item.image === broken ? "" : item.image;

  const content = (
    <>
      <div
        aria-hidden
        className="absolute inset-px rounded-xl bg-cream sketch"
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl border-[2.5px] border-page-edge ink"
      />
      <div className="relative grid grid-cols-[auto_1fr] items-start gap-x-4 p-3 sm:flex sm:h-full sm:flex-col sm:items-stretch sm:gap-3">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            // A picture that failed before hydration never fires onError
            ref={(img) => {
              if (img?.complete && img.naturalWidth === 0) setBroken(image);
            }}
            onError={() => setBroken(image)}
            className="aspect-square w-20 rounded-md object-cover sm:aspect-wide sm:w-full"
          />
        ) : (
          // Holds the picture's place so cards in a row stay alike
          <div className="flex aspect-square w-20 items-center justify-center rounded-md bg-page-ink/10 text-page-ink/40 sm:aspect-wide sm:w-full">
            <Newspaper size={28} className="sketch-subtle" />
          </div>
        )}
        <div
          className={cn(
            "flex min-w-0 flex-col gap-1 sm:px-1 sm:pb-1",
            item.url && "pr-5",
          )}
        >
          {item.source && (
            <span className="truncate text-xs uppercase tracking-wider text-page-ink/80">
              {item.source}
            </span>
          )}
          <h3 className="line-clamp-3 text-base uppercase leading-tight tracking-wide text-page-ink transition-colors group-hover/tile:text-rust sm:text-lg">
            {item.title}
          </h3>
        </div>
      </div>
      {item.url && (
        // On wider screens the picture fills the card's top, so the arrow
        // sits on a chip over the picture's corner
        <span className="absolute top-3 right-3 flex rounded-full text-rust sm:top-4.5 sm:right-4.5 sm:bg-cream sm:p-1 sm:shadow-md">
          <ArrowUpRight
            size={16}
            className="sketch-subtle group-hover/tile:sketch-subtle-animated"
          />
        </span>
      )}
    </>
  );

  const className =
    "group/tile relative block h-full rounded-xl transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

  return item.url ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, "hover:-rotate-1 hover:scale-102")}
    >
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

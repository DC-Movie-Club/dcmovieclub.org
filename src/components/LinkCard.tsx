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
        className="absolute inset-0 rounded-xl border-[2.5px] border-page-edge bg-cream sketch"
      />
      <div className="relative grid grid-cols-[auto_1fr] items-center gap-x-4 p-3 sm:flex sm:h-full sm:flex-col sm:items-stretch sm:gap-3">
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
        <div className="flex min-w-0 flex-col gap-1 sm:px-1 sm:pb-1">
          <div className="flex items-center justify-between gap-2 empty:hidden">
            {item.source && (
              <span className="truncate text-xs uppercase tracking-wider text-page-ink/80">
                {item.source}
              </span>
            )}
            {item.url && (
              <ArrowUpRight
                size={16}
                className="ml-auto shrink-0 text-rust sketch-subtle group-hover/tile:sketch-subtle-animated"
              />
            )}
          </div>
          <h3 className="line-clamp-3 text-base uppercase leading-tight tracking-wide text-page-ink transition-colors group-hover/tile:text-rust sm:text-lg">
            {item.title}
          </h3>
        </div>
      </div>
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

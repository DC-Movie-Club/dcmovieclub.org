"use client";

import { useState } from "react";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardItem } from "@/lib/pages";
import { textStyles } from "@/components/textStyles";
import { SketchIcon } from "@/components/system/SketchIcon";
import { Tile } from "@/components/system/Tile";

// A link with its site's preview picture, like a press piece. The picture is
// loaded from that site, so if it's gone the card shows without it.
export function LinkCard({ item }: { item: CardItem }) {
  // The picture address that failed, so a new one gets its own try
  const [broken, setBroken] = useState("");
  const image = item.image === broken ? "" : item.image;

  return (
    <Tile href={item.url || undefined} opens={Boolean(item.url)}>
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
          <div className="flex aspect-square w-20 items-center justify-center rounded-md bg-page-card-text/10 text-page-card-text/40 sm:aspect-wide sm:w-full">
            <SketchIcon icon={Newspaper} size={28} />
          </div>
        )}
        <div
          className={cn(
            "flex min-w-0 flex-col gap-1 sm:px-1 sm:pb-1",
            item.url && "pr-5",
          )}
        >
          {item.source && (
            <span className={cn("truncate", textStyles.tileMeta)}>
              {item.source}
            </span>
          )}
          <h3 className={cn("line-clamp-3", textStyles.tileTitle)}>
            {item.title}
          </h3>
        </div>
      </div>
      {item.url && (
        // On wider screens the picture fills the card's top, so the arrow
        // sits on a chip over the picture's corner
        <span className="absolute top-3 right-3 flex rounded-full text-rust sm:top-4.5 sm:right-4.5 sm:bg-cream sm:p-1 sm:shadow-md">
          <SketchIcon icon={ArrowUpRight} size={16} />
        </span>
      )}
    </Tile>
  );
}

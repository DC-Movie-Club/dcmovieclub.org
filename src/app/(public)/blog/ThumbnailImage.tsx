"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  blurDataUrl: string | null;
};

export function ThumbnailImage({ src, blurDataUrl }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-wide w-full shrink-0 overflow-hidden rounded-lg sm:aspect-square sm:w-36">
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 640px) 144px, 100vw"
        className="object-cover transition-transform group-hover/post:scale-105"
        onLoad={() => setLoaded(true)}
      />
      {blurDataUrl && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-cover bg-center transition-opacity duration-500",
            loaded ? "opacity-0" : "opacity-100",
          )}
          style={{
            backgroundImage: `url(${blurDataUrl})`,
            filter: "blur(16px)",
            transform: "scale(1.1)",
          }}
        />
      )}
    </div>
  );
}

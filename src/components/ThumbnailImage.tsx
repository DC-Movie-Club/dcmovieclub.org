"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  blurDataUrl: string | null;
  sizes: string;
  priority?: boolean;
  // "contain" shows the whole image, over its blur stretched to fill the frame
  fit?: "cover" | "contain";
  className?: string;
};

export function ThumbnailImage({
  src,
  blurDataUrl,
  sizes,
  priority,
  fit = "cover",
  className,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {blurDataUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${blurDataUrl})`,
            filter: "blur(16px)",
            transform: "scale(1.1)",
          }}
        />
      )}
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "transition-opacity duration-500",
          fit === "cover" ? "object-cover" : "object-contain",
          blurDataUrl && !loaded && "opacity-0",
        )}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  blurDataUrl: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function ThumbnailImage({
  src,
  blurDataUrl,
  sizes,
  priority,
  className,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
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

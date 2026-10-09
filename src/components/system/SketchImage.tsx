import { cn } from "@/lib/utils";
import { ThumbnailImage } from "@/components/system/ThumbnailImage";
import { SketchShape, wobbleClass, type SketchWeight } from "@/components/system/SketchShape";

// A picture with a line drawn over its edge. The picture takes the same
// wobble as the line, from the same corner, so its edge stays under the line
// wherever it moves; a straight edge would show past it or leave a gap.
// Shown whole, over a blur of itself where its shape differs from `aspect`.
export function SketchImage({
  src,
  blurDataUrl,
  sizes,
  priority,
  weight = "bold",
  aspect,
  radius,
  line,
  className,
}: {
  src: string;
  blurDataUrl: string | null;
  sizes: string;
  priority?: boolean;
  weight?: SketchWeight;
  aspect: string;
  radius: string;
  line: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <ThumbnailImage
        src={src}
        blurDataUrl={blurDataUrl}
        sizes={sizes}
        priority={priority}
        fit="contain"
        className={cn(aspect, radius, wobbleClass(weight))}
      />
      <SketchShape weight={weight} radius={radius} line={line} />
    </div>
  );
}

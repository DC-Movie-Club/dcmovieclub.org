import { cn } from "@/lib/utils";
import { SketchShape } from "@/components/system/SketchShape";
import { textStyles } from "@/components/system/textStyles";

// A cream sticker with a faint edge, the same on any card or page: dates,
// ratings, partner names. `as` makes it a list item; `className` places it
// and can soften its text (textStyles.stickerDate). A link on it rings
// keyboard focus in rust.
export function Sticker({
  as: Tag = "span",
  className,
  children,
}: {
  as?: "span" | "li";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "relative flex w-fit items-center whitespace-nowrap px-3 py-1.5 focus-ring-rust",
        textStyles.stickerText,
        className,
      )}
    >
      <SketchShape weight="fine" fill="border-2 border-charcoal/25 bg-cream shadow-md" />
      <span className="relative flex items-center gap-1.5">{children}</span>
    </Tag>
  );
}

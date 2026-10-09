import { cn } from "@/lib/utils";

// The site's column: up to 48rem (max-w-3xl) of content, centered, with
// 1.5rem gutters at the screen's edges on phones
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "section" | "h1";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[calc(var(--container-3xl)+3rem)] px-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

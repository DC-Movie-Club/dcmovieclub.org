import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/navigation";

// In the page's colors, so it fills with the text color and takes the
// background color for its label on hover
export function HomeLink({ className }: { className?: string }) {
  return (
    <NextLink
      href={routes.home.href}
      className={cn(
        "group/home relative block w-fit rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-page-fg",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-page-fg/70 transition-colors sketch-subtle group-hover/home:border-page-fg group-hover/home:bg-page-fg group-hover/home:sketch-subtle-animated"
      />
      <span className="relative flex items-center gap-1.5 px-4 py-2 text-sm uppercase tracking-widest text-page-fg transition-colors group-hover/home:text-page-bg">
        <ArrowLeft size={14} />
        {routes.home.label}
      </span>
    </NextLink>
  );
}

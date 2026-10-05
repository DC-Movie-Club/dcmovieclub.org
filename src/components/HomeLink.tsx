import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/navigation";

export function HomeLink({ className }: { className?: string }) {
  return (
    <NextLink
      href={routes.home.href}
      className={cn("group/home relative block w-fit outline-none", className)}
    >
      {/* The tint bleeds past the label so the arrow lines up with the page title */}
      <span
        aria-hidden
        className="absolute -inset-x-3 inset-y-0 rounded-full transition-colors sketch-subtle group-hover/home:bg-page-fg/10 group-hover/home:sketch-subtle-animated group-focus-visible/home:outline-2 group-focus-visible/home:outline-page-fg"
      />
      <span className="relative flex items-center gap-1.5 py-2 text-sm uppercase tracking-widest text-page-fg/80 transition-colors group-hover/home:text-page-fg">
        <ArrowLeft size={14} />
        {routes.home.label}
      </span>
    </NextLink>
  );
}

import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { routes } from "@/config/navigation";

export function HomeLink() {
  return (
    <NextLink
      href={routes.home.href}
      className="group/home relative block w-fit outline-none"
    >
      {/* The tint bleeds past the label so the arrow lines up with the page title */}
      <span
        aria-hidden
        className="absolute -inset-x-3 inset-y-0 rounded-full transition-colors sketch-subtle group-hover/home:bg-page-fg/10 group-hover/home:sketch-subtle-animated group-focus-visible/home:outline-2 group-focus-visible/home:outline-page-fg"
      />
      <span className="relative flex items-center gap-2 py-2 text-base uppercase tracking-widest text-page-fg sm:text-lg">
        <ArrowLeft className="size-4 sm:size-5" />
        {routes.home.label}
      </span>
    </NextLink>
  );
}

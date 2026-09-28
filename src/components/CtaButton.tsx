import NextLink from "next/link";
import { ArrowRight } from "lucide-react";

// A pill button in the page's accent colors
export function CtaButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink
      href={href}
      className="group/cta relative self-start rounded-full sm:self-auto transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-[3px] border-page-accent-edge bg-page-accent shadow-lg sketch group-hover/cta:sketch-animated"
      />
      <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-page-accent-text sm:px-6 sm:py-3 sm:text-base">
        {children}
        <ArrowRight size={18} className="shrink-0" />
      </span>
    </NextLink>
  );
}

import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes, socials } from "@/config/navigation";

const EMAIL = "hello@dcmovieclub.org";

// The bottom nav's order, with About in the place of the More menu it lives in
const footerLinks = [
  routes.blog,
  routes.events,
  routes.home,
  routes.partnerships,
  routes.about,
];

const LINK =
  "transition-colors hover:text-page-fg hover:sketch-subtle-animated";

// Colored by the page it sits on, so it has to render inside the element that
// sets the page's color variables. The panel is the page background darkened.
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "relative mx-auto w-full max-w-3xl text-sm uppercase tracking-widest",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-black/10 sketch"
      />
      <div className="relative flex flex-col gap-4 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 text-page-fg/80 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.key}>
                  <NextLink href={link.href} className={LINK}>
                    {link.labelShort}
                  </NextLink>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex items-center gap-4">
            {Object.values(socials).map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="group/social block transition-colors hover:text-page-fg"
                >
                  <link.icon
                    size={20}
                    className="sketch-subtle group-hover/social:sketch-subtle-animated"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 text-page-fg/60 sm:flex-row sm:justify-between">
          <a
            href="https://gus.siteless.co"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("flex w-fit items-center gap-1", LINK)}
          >
            Site by Gus
            <ArrowUpRight size={12} />
          </a>
          <p className="flex flex-wrap gap-x-2">
            <span>© {new Date().getFullYear()} DC Movie Club</span>
            <span aria-hidden>·</span>
            <a href={`mailto:${EMAIL}`} className={LINK}>
              {EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

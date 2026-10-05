import NextLink from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes, socials } from "@/config/navigation";

const EMAIL = "hello@dcmovieclub.org";
const FOUNDED = 2023;

const footerLinks = [
  routes.home,
  routes.events,
  routes.blog,
  routes.about,
  routes.partnerships,
  { key: "conduct", label: "Code of Conduct", href: "/about#conduct" },
];

const LINK =
  "decoration-2 underline-offset-4 hover:underline hover:sketch-subtle-animated";

// Colored by the page it sits on, so it has to render inside the element that
// sets the page's color variables
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col gap-8 text-page-fg",
        className,
      )}
    >
      <hr className="border-t-2 border-page-fg/30 sketch" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-3">
          <a
            href={`${socials.substack.href}/subscribe`}
            target="_blank"
            rel="noopener noreferrer"
            className="group/subscribe relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-page-fg"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-page-fg transition-colors sketch-subtle group-hover/subscribe:bg-page-fg group-hover/subscribe:sketch-subtle-animated"
            />
            <span className="relative flex items-center gap-2 px-4 py-2 text-sm uppercase tracking-widest transition-colors group-hover/subscribe:text-page-bg">
              <Mail size={14} />
              Get the newsletter
            </span>
          </a>
          <a href={`mailto:${EMAIL}`} className={LINK}>
            {EMAIL}
          </a>
        </div>

        <ul className="flex items-center gap-5">
          {Object.values(socials).map((link) => (
            <li key={link.key}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="group/social block transition-transform hover:scale-110"
              >
                <link.icon
                  size={24}
                  className="sketch-subtle group-hover/social:sketch-subtle-animated"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-widest">
          {footerLinks.map((link) => (
            <li key={link.key}>
              <NextLink href={link.href} className={LINK}>
                {link.label}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-2 text-sm uppercase tracking-widest sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} DC Movie Club · Est. {FOUNDED}
        </p>
        <a
          href="https://gus.siteless.co"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("flex w-fit items-center gap-1", LINK)}
        >
          Site by Gus
          <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}

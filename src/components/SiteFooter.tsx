import NextLink from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { textStyles } from "@/components/textStyles";
import { routes, socials } from "@/config/navigation";

const EMAIL = "hello@dcmovieclub.org";
const FOUNDED = 2023;

// The bottom nav's order, with Partnerships and Contact in the place of the
// More menu they live in
const footerLinks = [
  routes.events,
  routes.blog,
  routes.home,
  routes.about,
  routes.partnerships,
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
      <SubscribeDialog
        trigger={
          <button
            type="button"
            className="group/subscribe absolute top-0 left-1/2 z-10 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-105 focus-ring"
          />
        }
      >
        <span
          aria-hidden
          className="absolute inset-px rounded-full bg-page-accent sketch group-hover/subscribe:boil"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-[3px] border-page-accent-edge ink group-hover/subscribe:boil"
        />
        <span
          className={cn(
            "relative flex items-center gap-2 px-5 py-2.5 whitespace-nowrap",
            textStyles.accentPillSmall,
          )}
        >
          <Mail size={18} className="shrink-0" />
          Subscribe to our newsletter
        </span>
      </SubscribeDialog>
      <div className="relative flex flex-col gap-4 px-7 pt-8 pb-5">
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
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className={cn("flex items-center gap-1", LINK)}
                >
                  {routes.contact.labelShort}
                  <ArrowUpRight size={12} />
                </a>
              </li>
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
      </div>
    </footer>
  );
}

import { ArrowUpRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { routes } from "@/config/navigation";
import { Pill } from "@/components/system/Pill";
import { TextLink } from "@/components/system/SmartLink";
import { SocialLinks } from "@/components/system/SocialLinks";
import { textStyles } from "@/components/textStyles";

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

// Text links light up in the page's text color, as the rust of links on
// cards wouldn't show on every page
const LINK = "hover:text-page-fg";

// Colored by the page it sits on, so it has to render inside the element that
// sets the page's color variables (PageShell places it). The panel is the page
// background darkened.
export function SiteFooter() {
  return (
    <footer className="relative">
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-black/10 sketch"
      />
      <SubscribeDialog
        trigger={
          <Pill
            variant="accent"
            icon={Mail}
            className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          >
            Subscribe to our newsletter
          </Pill>
        }
      />
      <div className="relative flex flex-col gap-4 px-7 pt-8 pb-5">
        <div
          className={cn(
            "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
            textStyles.footerLinks,
          )}
        >
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.key}>
                  <TextLink href={link.href} className={LINK}>
                    {link.labelShort}
                  </TextLink>
                </li>
              ))}
              <li>
                <TextLink
                  href={routes.contact.href}
                  className={cn("flex items-center gap-1", LINK)}
                >
                  {routes.contact.labelShort}
                  <ArrowUpRight size={12} />
                </TextLink>
              </li>
            </ul>
          </nav>

          <SocialLinks size={20} linkClassName="hover:text-page-fg" />
        </div>

        <div
          className={cn(
            "flex flex-col gap-2 sm:flex-row sm:justify-between",
            textStyles.footerNote,
          )}
        >
          <p>
            © {new Date().getFullYear()} DC Movie Club · Est. {FOUNDED}
          </p>
          <TextLink
            href="https://gus.siteless.co"
            className={cn("flex w-fit items-center gap-1", LINK)}
          >
            Site by Gus
            <ArrowUpRight size={12} />
          </TextLink>
        </div>
      </div>
    </footer>
  );
}

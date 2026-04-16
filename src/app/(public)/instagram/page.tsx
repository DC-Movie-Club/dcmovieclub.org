{/* Instagram link-in-bio replacement for Linktree. Will display recent posts
    as clickable tiles linking to events, articles, and ticket pages.
    Reference: https://www.instagram.com/bostonglobe/ style link-in-bio page.
    Should eventually be dynamically populated, but can start as a manually updated list. */}

import { Link, ExternalLink } from "@/components/ui/link";

const placeholderLinks = [
  { label: "Next Event: TBD", href: "/events", external: false },
  { label: "Join Our Newsletter", href: "https://dcmovieclub.substack.com", external: true },
  { label: "About Us", href: "/about", external: false },
] as const;

export default function Instagram() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-3xl uppercase tracking-wide">DC Movie Club</h1>
      <p className="text-muted-foreground">A community of film lovers in DC</p>
      <div className="mt-4 flex w-full flex-col gap-3">
        {placeholderLinks.map((link) =>
          link.external ? (
            <ExternalLink
              key={link.href}
              href={link.href}
              className="block w-full rounded border border-border px-4 py-3 text-center uppercase tracking-wide transition-colors hover:border-rust"
            >
              {link.label}
            </ExternalLink>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="block w-full rounded border border-border px-4 py-3 text-center uppercase tracking-wide transition-colors hover:border-rust"
            >
              {link.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

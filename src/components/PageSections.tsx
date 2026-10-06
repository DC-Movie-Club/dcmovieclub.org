import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkCard } from "@/components/LinkCard";
import { Markdown } from "@/components/Markdown";
import { markdownStyles } from "@/components/markdownStyles";
import { SectionCard } from "@/components/section-cards";
import { textStyles } from "@/components/textStyles";
import { Link, ExternalLink } from "@/components/ui/link";
import type { FaqItem, LinkItem, PageSection } from "@/lib/pages";

function LinkListItem({ item }: { item: LinkItem }) {
  if (!item.url) return <li>{item.title}</li>;
  const LinkComponent = item.url.startsWith("/") ? Link : ExternalLink;
  return (
    <li>
      <LinkComponent href={item.url} className={textStyles.proseLink}>
        {item.title}
      </LinkComponent>
    </li>
  );
}

function TagItem({ item }: { item: LinkItem }) {
  return (
    <li className={cn("relative px-4 py-2", textStyles.stickerText)}>
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-page-accent-edge/30 bg-page-accent/20 shadow-sm sketch-subtle"
      />
      {item.url ? (
        <ExternalLink href={item.url} className="relative">
          {item.title}
        </ExternalLink>
      ) : (
        <span className="relative">{item.title}</span>
      )}
    </li>
  );
}

// For sections whose items are their own cards, so the heading sits on the
// page instead of on a card
function ListHeading({ children }: { children: string }) {
  return (
    <h2 className={textStyles.labelLettering}>{children}</h2>
  );
}

// The height animation uses ::details-content where supported; elsewhere it
// just toggles
export function FaqEntry({ item }: { item: FaqItem }) {
  return (
    // The card is drawn with ::before (its fill) and ::after (its line, over
    // everything, so it lets clicks through) because any child element other
    // than <summary> lands in ::details-content, which is hidden while closed.
    <details className="group/faq relative [interpolate-size:allow-keywords] before:absolute before:inset-px before:rounded-xl before:bg-cream before:shadow-lg before:content-[''] before:sketch after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:border-[2.5px] after:border-page-edge after:content-[''] after:ink [&::details-content]:h-0 [&::details-content]:overflow-hidden [&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-300 [&::details-content]:[transition-behavior:allow-discrete] open:[&::details-content]:h-auto">
      <summary className="relative flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className={textStyles.cardQuestion}>
          {item.question}
        </span>
        <span className="relative flex size-8 shrink-0 items-center justify-center text-page-accent-text">
          <span
            aria-hidden
            className="absolute inset-px rounded-full bg-page-accent sketch-subtle group-hover/faq:boil"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-page-accent-edge ink-subtle group-hover/faq:boil"
          />
          <Plus
            size={16}
            strokeWidth={3}
            className="relative transition-transform duration-300 group-open/faq:rotate-45"
          />
        </span>
      </summary>
      <div className="relative mx-5 border-t border-dashed border-charcoal/20 pt-4 pb-6 sm:mx-6">
        <Markdown>{item.answer}</Markdown>
      </div>
    </details>
  );
}

function Section({ section }: { section: PageSection }) {
  switch (section.kind) {
    case "text":
      return section.content.trim() ? (
        <SectionCard id={section.key} label={section.label}>
          <Markdown>{section.content}</Markdown>
        </SectionCard>
      ) : null;
    case "links":
      return section.items.length > 0 ? (
        <SectionCard id={section.key} label={section.label}>
          <ul className={markdownStyles.ul}>
            {section.items.map((item) => (
              <LinkListItem key={item.key} item={item} />
            ))}
          </ul>
        </SectionCard>
      ) : null;
    case "tags":
      return section.items.length > 0 ? (
        <SectionCard id={section.key} label={section.label}>
          <ul className="flex flex-wrap gap-3">
            {section.items.map((item) => (
              <TagItem key={item.key} item={item} />
            ))}
          </ul>
        </SectionCard>
      ) : null;
    case "cards": {
      // A card still being filled in stays off the page until it has a link
      // and a headline
      const items = section.items.filter(
        (item) => item.url.trim() && item.title.trim(),
      );
      return items.length > 0 ? (
        <section id={section.key} className="flex scroll-mt-8 flex-col gap-8">
          {section.label && <ListHeading>{section.label}</ListHeading>}
          <ul className="grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <li key={item.key}>
                <LinkCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null;
    }
    case "faq":
      return section.items.length > 0 ? (
        <section id={section.key} className="flex scroll-mt-8 flex-col gap-8">
          {section.label && <ListHeading>{section.label}</ListHeading>}
          <div className="flex flex-col gap-4">
            {section.items.map((item) => (
              <FaqEntry key={item.key} item={item} />
            ))}
          </div>
        </section>
      ) : null;
  }
}

export function PageSections({ sections }: { sections: PageSection[] }) {
  return sections.map((section) => (
    <Section key={section.key} section={section} />
  ));
}

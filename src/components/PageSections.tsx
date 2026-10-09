import { Plus } from "lucide-react";
import { LinkCard } from "@/components/LinkCard";
import { Markdown } from "@/components/Markdown";
import { markdownStyles } from "@/components/markdownStyles";
import { SectionCard } from "@/components/section-cards";
import { textStyles } from "@/components/textStyles";
import { Pill } from "@/components/system/Pill";
import { TextLink } from "@/components/system/SmartLink";
import { Sticker } from "@/components/system/Sticker";
import type { FaqItem, LinkItem, PageSection } from "@/lib/pages";

function LinkListItem({ item }: { item: LinkItem }) {
  if (!item.url) return <li>{item.title}</li>;
  return (
    <li>
      <TextLink href={item.url} className={textStyles.proseLink}>
        {item.title}
      </TextLink>
    </li>
  );
}

// A tags section's items as stickers, after `children` (list items)
export function TagList({
  items,
  children,
}: {
  items: LinkItem[];
  children?: React.ReactNode;
}) {
  return (
    <ul className="flex flex-wrap items-center gap-3">
      {children}
      {items.map((item) => (
        <Sticker key={item.key} as="li">
          {item.url ? <TextLink href={item.url}>{item.title}</TextLink> : item.title}
        </Sticker>
      ))}
    </ul>
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
    <details className="group/faq group/card relative [interpolate-size:allow-keywords] before:absolute before:inset-px before:rounded-xl before:bg-cream before:shadow-lg before:content-[''] before:sketch after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:border-[2.5px] after:border-page-edge after:content-[''] after:ink [&::details-content]:h-0 [&::details-content]:overflow-hidden [&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-300 [&::details-content]:[transition-behavior:allow-discrete] open:[&::details-content]:h-auto">
      <summary className="relative flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 focus-ring focus-ring-rust sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className={textStyles.cardQuestion}>
          {item.question}
        </span>
        <Pill
          decorative
          variant="accent"
          round
          size="sm"
          withCard
          icon={Plus}
          iconClassName="transition-transform duration-300 group-open/faq:rotate-45"
        />
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
          <TagList items={section.items} />
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

import { LinkCard } from "@/components/LinkCard";
import { TileGrid } from "@/components/layout/TileGrid";
import { Markdown } from "@/components/Markdown";
import { markdownStyles } from "@/components/markdownStyles";
import { textStyles } from "@/components/textStyles";
import { Card } from "@/components/system/Card";
import { DisclosureCard } from "@/components/system/DisclosureCard";
import { TextLink } from "@/components/system/SmartLink";
import { Sticker } from "@/components/system/Sticker";
import type { LinkItem, PageSection } from "@/lib/pages";

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

function Section({ section }: { section: PageSection }) {
  switch (section.kind) {
    case "text":
      return section.content.trim() ? (
        <Card as="section" id={section.key} label={section.label}>
          <Markdown>{section.content}</Markdown>
        </Card>
      ) : null;
    case "links":
      return section.items.length > 0 ? (
        <Card as="section" id={section.key} label={section.label}>
          <ul className={markdownStyles.ul}>
            {section.items.map((item) => (
              <LinkListItem key={item.key} item={item} />
            ))}
          </ul>
        </Card>
      ) : null;
    case "tags":
      return section.items.length > 0 ? (
        <Card as="section" id={section.key} label={section.label}>
          <TagList items={section.items} />
        </Card>
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
          <TileGrid columns={3}>
            {items.map((item) => (
              <li key={item.key}>
                <LinkCard item={item} />
              </li>
            ))}
          </TileGrid>
        </section>
      ) : null;
    }
    case "faq":
      return section.items.length > 0 ? (
        <section id={section.key} className="flex scroll-mt-8 flex-col gap-8">
          {section.label && <ListHeading>{section.label}</ListHeading>}
          <div className="flex flex-col gap-4">
            {section.items.map((item) => (
              <DisclosureCard key={item.key} summary={item.question}>
                <Markdown>{item.answer}</Markdown>
              </DisclosureCard>
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

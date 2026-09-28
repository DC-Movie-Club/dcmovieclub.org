import { PageTitle } from "@/components/ColorPage";
import { CtaButton } from "@/components/CtaButton";
import { FaqEntry } from "@/components/PageSections";
import { SectionCard } from "@/components/section-cards";
import { SketchFilter } from "@/components/SketchFilter";
import { Markdown } from "@/components/Markdown";
import { colorVars, type PageColors } from "@/config/pages";
import type { PageCta, PageSection } from "@/lib/pages";

// A cut-down copy of the page, built from the same components, so color
// changes can be judged before saving
export function PagePreview({
  title,
  cta,
  colors,
  sections,
}: {
  title: string;
  cta: PageCta | null;
  colors: PageColors;
  sections: PageSection[];
}) {
  const card = sections.find(
    (section) => section.kind === "text" && section.label && section.content,
  );
  const faq = sections.find((section) => section.kind === "faq");
  const question = faq?.kind === "faq" ? faq.items[0] : undefined;

  return (
    <div
      inert
      className="pointer-events-none overflow-hidden rounded-lg border font-dcmc"
    >
      <SketchFilter />
      <div
        className="flex flex-col gap-10 bg-page-bg px-6 pt-8 pb-10"
        style={colorVars(colors)}
      >
        <header className="flex flex-wrap items-end justify-between gap-4">
          <PageTitle className="text-4xl sm:text-4xl">{title}</PageTitle>
          {cta && <CtaButton href={cta.href}>{cta.label}</CtaButton>}
        </header>
        {card?.kind === "text" && (
          <SectionCard label={card.label}>
            <div className="line-clamp-3">
              <Markdown>{card.content}</Markdown>
            </div>
          </SectionCard>
        )}
        {question && <FaqEntry item={question} />}
      </div>
    </div>
  );
}

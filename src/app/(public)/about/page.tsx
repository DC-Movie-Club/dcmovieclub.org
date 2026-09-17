import { Children } from "react";
import NextLink from "next/link";
import type { Components } from "react-markdown";
import { ArrowRight, Plus } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { sectionCardOverrides } from "@/components/section-cards";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";

const aboutOverrides = sectionCardOverrides("outline-ink-page-ink");

// Styles the FAQ's `:::details[Question]` blocks as expandable rows. The height
// animation uses ::details-content where supported; elsewhere it just toggles.
const faqOverrides: Components = {
  details: ({ children }) => {
    const [summary, ...answer] = Children.toArray(children);
    return (
      // The card is drawn with ::before because any child element other than
      // <summary> lands in ::details-content, which is hidden while closed.
      <details className="group/faq relative [interpolate-size:allow-keywords] before:absolute before:inset-0 before:rounded-xl before:border-[2.5px] before:border-page-edge before:bg-cream before:shadow-lg before:content-[''] before:sketch [&::details-content]:h-0 [&::details-content]:overflow-hidden [&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-300 [&::details-content]:[transition-behavior:allow-discrete] open:[&::details-content]:h-auto">
        {summary}
        <div className="relative mx-5 border-t border-dashed border-charcoal/20 pt-4 pb-6 sm:mx-6">
          {answer}
        </div>
      </details>
    );
  },
  summary: ({ children }) => (
    <summary className="relative flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust sm:px-6 [&::-webkit-details-marker]:hidden">
      <span className="text-lg uppercase leading-snug tracking-wider text-charcoal sm:text-xl">
        {children}
      </span>
      <span className="relative flex size-8 shrink-0 items-center justify-center text-cream">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-rust-dark bg-rust sketch-subtle group-hover/faq:sketch-subtle-animated"
        />
        <Plus
          size={16}
          strokeWidth={3}
          className="relative transition-transform duration-300 group-open/faq:rotate-45"
        />
      </span>
    </summary>
  ),
};

export default async function About() {
  const [about, faq] = await Promise.all([
    getCopy(copySlots.about.key),
    getCopy(copySlots.faq.key),
  ]);

  return (
    <ColorPage
      className="bg-sky page-ink-sky-dark page-edge-sky-light"
      contentClassName="gap-16"
    >
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageTitle>About</PageTitle>
        <NextLink
          href="/code-of-conduct"
          className="group/cta relative self-start rounded-full sm:self-auto transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-[3px] border-rust-dark bg-rust shadow-lg sketch group-hover/cta:sketch-animated"
          />
          <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-cream sm:px-6 sm:py-3 sm:text-base">
            Read our Code of Conduct
            <ArrowRight size={18} className="shrink-0" />
          </span>
        </NextLink>
      </header>

      {about.content.trim() && (
        <Markdown
          sections={{ depth: 2 }}
          overrides={aboutOverrides}
          className="flex flex-col gap-16"
        >
          {about.content}
        </Markdown>
      )}

      {faq.content.trim() && (
        <section id="faq" className="flex scroll-mt-8 flex-col gap-8">
          <h2 className="text-4xl uppercase leading-none tracking-wide text-cream outlined-lettering outline-ink-page-ink sm:text-5xl">
            FAQ
          </h2>
          <Markdown overrides={faqOverrides} className="flex flex-col gap-4">
            {faq.content}
          </Markdown>
        </section>
      )}
    </ColorPage>
  );
}

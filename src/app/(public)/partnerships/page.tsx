import type { Components } from "react-markdown";
import { Markdown } from "@/components/Markdown";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";
import { splitMarkdownSections } from "@/lib/markdown-sections";
import type { MarkdownSection } from "@/lib/markdown-sections";
import { outlinedTextStyle } from "@/components/events/outlined-text";

// Bulleted lists on this page are partner names, so they render as stickers.
const markdownOverrides: Components = {
  ul: ({ children }) => (
    <ul className="mt-4 flex flex-wrap gap-3 first:mt-0">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="relative px-4 py-2 text-base uppercase leading-none tracking-wide text-charcoal">
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-olive-dark/30 bg-olive/20 shadow-sm sketch-subtle"
      />
      <span className="relative">{children}</span>
    </li>
  ),
};

// A fixed angle lifts the far end of a long heading well above the card, so the
// tilt shrinks with length to keep that rise roughly constant (capped at 3deg).
function headingTilt(heading: string) {
  return -Math.min(3, 30 / heading.length);
}

function SectionCard({ section }: { section: MarkdownSection }) {
  return (
    <section className="relative flex flex-col items-start">
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl border-[3px] border-charcoal bg-cream shadow-xl sketch"
      />

      {/* A small negative margin lets the label's top poke over the card's
          edge while it stays in flow, so long headings can wrap. */}
      {section.heading && (
        <h2
          className="relative -mt-2.5 ml-4 mr-4 origin-bottom-left text-3xl uppercase leading-none tracking-wide text-cream [--outline-ink:var(--color-charcoal)] sm:-mt-3 sm:ml-6 sm:text-4xl"
          style={{
            ...outlinedTextStyle,
            rotate: `${headingTilt(section.heading)}deg`,
          }}
        >
          {section.heading}
        </h2>
      )}

      {section.body && (
        <Markdown
          overrides={markdownOverrides}
          className="relative self-stretch px-6 pt-4 pb-8 sm:px-8"
        >
          {section.body}
        </Markdown>
      )}

    </section>
  );
}

export default async function Partnerships() {
  const { content } = await getCopy(copySlots.partnerships.key);
  const sections = splitMarkdownSections(content);

  return (
    // The negative margin cancels the layout's bottom padding (reserved for the
    // nav) so the color runs to the bottom edge; pb-36 re-adds that clearance.
    <div className="-mb-24 min-h-screen bg-purple px-6 pt-14 pb-36 sm:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-16">
        <h1
          className="text-4xl uppercase leading-none tracking-wide text-cream [--outline-ink:var(--color-charcoal)] sm:text-6xl"
          style={outlinedTextStyle}
        >
          Partnerships
        </h1>

        {sections.length > 0 ? (
          sections.map((section, i) => (
            <SectionCard key={`${i}-${section.heading}`} section={section} />
          ))
        ) : (
          <SectionCard
            section={{ heading: null, body: "Partnership details coming soon." }}
          />
        )}
      </div>
    </div>
  );
}

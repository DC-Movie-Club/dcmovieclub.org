import type { Components } from "react-markdown";
import { Markdown } from "@/components/Markdown";
import { sectionCardOverrides } from "@/components/section-cards";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";
import { outlinedTextStyle } from "@/components/events/outlined-text";

const markdownOverrides: Components = {
  ...sectionCardOverrides("outline-ink-page-ink"),
  // Bulleted lists on this page are partner names, so they render as stickers.
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

export default async function Partnerships() {
  const { content } = await getCopy(copySlots.partnerships.key);

  return (
    // The negative margin cancels the layout's bottom padding (reserved for the
    // nav) so the color runs to the bottom edge; pb-36 re-adds that clearance.
    <div className="-mb-24 min-h-screen bg-purple page-ink-purple-dark page-edge-purple-light px-6 pt-14 pb-36 sm:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-16">
        <h1
          className="text-4xl uppercase leading-none tracking-wide text-cream outline-ink-purple-dark sm:text-6xl"
          style={outlinedTextStyle}
        >
          Partnerships
        </h1>

        <Markdown
          sections={{ depth: 2 }}
          overrides={markdownOverrides}
          className="flex flex-col gap-16"
        >
          {content.trim() || "Partnership details coming soon."}
        </Markdown>
      </div>
    </div>
  );
}

import type { Components } from "react-markdown";
import { Markdown } from "@/components/Markdown";
import { sectionCardOverrides } from "@/components/section-cards";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";
import { ColorPage, PageTitle } from "@/components/ColorPage";

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
    <ColorPage
      className="bg-purple page-ink-purple-dark page-edge-purple-light"
      contentClassName="gap-16"
    >
      <PageTitle className="text-4xl">Partnerships</PageTitle>

      <Markdown
        sections={{ depth: 2 }}
        overrides={markdownOverrides}
        className="flex flex-col gap-16"
      >
        {content.trim() || "Partnership details coming soon."}
      </Markdown>
    </ColorPage>
  );
}

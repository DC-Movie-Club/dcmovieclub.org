import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { PageSections } from "@/components/PageSections";
import { pageTemplates } from "@/config/pages";
import { getPage } from "@/lib/pages";

export default async function About() {
  const page = await getPage(pageTemplates.about.key);

  return (
    <ColorPage colors={page.colors} contentClassName="gap-16">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageTitle>{page.title}</PageTitle>
        {page.cta && (
          <NextLink
            href={page.cta.href}
            className="group/cta relative self-start rounded-full sm:self-auto transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border-[3px] border-page-accent-edge bg-page-accent shadow-lg sketch group-hover/cta:sketch-animated"
            />
            <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-page-accent-text sm:px-6 sm:py-3 sm:text-base">
              {page.cta.label}
              <ArrowRight size={18} className="shrink-0" />
            </span>
          </NextLink>
        )}
      </header>

      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

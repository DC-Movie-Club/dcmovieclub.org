import { ColorPage, PageTitle } from "@/components/ColorPage";
import { CtaButton } from "@/components/CtaButton";
import { PageSections } from "@/components/PageSections";
import { pageTemplates } from "@/config/pages";
import { getPage } from "@/lib/pages";

export default async function About() {
  const page = await getPage(pageTemplates.about.key);

  return (
    <ColorPage colors={page.colors} contentClassName="gap-16">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageTitle>{page.title}</PageTitle>
        {page.cta && <CtaButton href={page.cta.href}>{page.cta.label}</CtaButton>}
      </header>

      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

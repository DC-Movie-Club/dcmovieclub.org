import { ColorPage, PageTitle } from "@/components/ColorPage";
import { PageSections } from "@/components/PageSections";
import { pageTemplates } from "@/config/pages";
import { getPage } from "@/lib/pages";

export default async function About() {
  const page = await getPage(pageTemplates.about.key);

  return (
    <ColorPage colors={page.colors} contentClassName="gap-16">
      <PageTitle>{page.title}</PageTitle>
      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

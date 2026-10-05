import { ColorPage, PageTitle } from "@/components/ColorPage";
import { PageSections } from "@/components/PageSections";
import { pageTemplates } from "@/config/pages";
import { getPage } from "@/lib/pages";

export default async function Partnerships() {
  const page = await getPage(pageTemplates.partnerships.key);

  return (
    <ColorPage colors={page.colors} contentClassName="gap-16">
      <PageTitle className="text-4xl">{page.title}</PageTitle>
      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

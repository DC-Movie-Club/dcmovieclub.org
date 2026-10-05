import { ColorPage, PageTitle } from "@/components/ColorPage";
import { PageSections } from "@/components/PageSections";
import type { PageView } from "@/lib/pages";

export function PartnershipsPage({ page }: { page: PageView }) {
  return (
    <ColorPage colors={page.colors} contentClassName="gap-16">
      <PageTitle className="text-4xl">{page.title}</PageTitle>
      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

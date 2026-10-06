import { ColorPage, PageTitle } from "@/components/ColorPage";
import { PageSections } from "@/components/PageSections";
import type { PageView } from "@/lib/pages";

export function PartnershipsPage({ page }: { page: PageView }) {
  return (
    <ColorPage
      colors={page.colors}
      header={<PageTitle className="text-4xl">{page.title}</PageTitle>}
      contentClassName="mt-12 gap-16"
    >
      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

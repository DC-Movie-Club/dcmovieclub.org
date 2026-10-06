import { ColorPage, PageTitle } from "@/components/ColorPage";
import { PageSections } from "@/components/PageSections";
import type { PageView } from "@/lib/pages";

export function AboutPage({ page }: { page: PageView }) {
  return (
    <ColorPage
      colors={page.colors}
      header={<PageTitle>{page.title}</PageTitle>}
      contentClassName="gap-16"
    >
      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

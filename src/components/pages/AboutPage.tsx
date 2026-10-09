import { PageContent, PageHeader, PageShell } from "@/components/layout/PageShell";
import { PageSections } from "@/components/PageSections";
import type { PageView } from "@/lib/pages";

export function AboutPage({ page }: { page: PageView }) {
  return (
    <PageShell colors={page.colors}>
      <PageHeader title={page.title} />
      <PageContent className="gap-16">
        <PageSections sections={page.sections} />
      </PageContent>
    </PageShell>
  );
}

import { PageContent, PageHeader, PageShell } from "@/components/layout/PageShell";
import { PageSections } from "@/components/sections/PageSections";
import type { PageView } from "@/lib/pages";

export function PartnershipsPage({ page }: { page: PageView }) {
  return (
    <PageShell colors={page.colors}>
      <PageHeader title={page.title} />
      <PageContent className="mt-12 gap-16">
        <PageSections sections={page.sections} />
      </PageContent>
    </PageShell>
  );
}

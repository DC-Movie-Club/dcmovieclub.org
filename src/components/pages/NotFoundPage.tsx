import { PageHeader, PageShell } from "@/components/layout/PageShell";

// The page for an address with nothing at it. It has no page of its own in
// Firestore, so it takes the default colors.
export function NotFoundPage() {
  return (
    <PageShell>
      <PageHeader title="404" subtitle="Page not found" />
    </PageShell>
  );
}

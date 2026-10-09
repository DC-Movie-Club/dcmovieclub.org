import { BottomNav } from "@/components/layout/BottomNav";
import { PageReveal } from "@/components/layout/PageReveal";
import { SketchFilter } from "@/components/system/SketchFilter";

// What every public page sits in: the sketch filters, the page, the bottom
// nav, and PageReveal, which holds the entrance until the page is laid out.
// `accents` and `backgrounds` color the nav (see BottomNav).
export function PublicChrome({
  accents,
  backgrounds,
  children,
}: {
  accents: Record<string, string>;
  backgrounds: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SketchFilter />
      <main className="animate-page-fade-in">{children}</main>
      <BottomNav accents={accents} backgrounds={backgrounds} />
      <PageReveal />
    </div>
  );
}

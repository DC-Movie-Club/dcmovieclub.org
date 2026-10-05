import { BottomNav } from "@/components/BottomNav";
import { PageReveal } from "@/components/PageReveal";
import { SketchFilter } from "@/components/SketchFilter";
import { WatercolorFilter } from "@/components/WatercolorFilter";
import { getPageAccents, getPageBackgrounds } from "@/lib/pages";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SketchFilter />
      <WatercolorFilter />
      <main className="pb-24 animate-page-fade-in">{children}</main>
      <BottomNav
        accents={await getPageAccents()}
        backgrounds={await getPageBackgrounds()}
      />
      <PageReveal />
    </div>
  );
}

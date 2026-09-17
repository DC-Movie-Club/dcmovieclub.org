import { BottomNav } from "@/components/BottomNav";
import { PageReveal } from "@/components/PageReveal";
import { SketchFilter } from "@/components/SketchFilter";
import { WatercolorFilter } from "@/components/WatercolorFilter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SketchFilter />
      <WatercolorFilter />
      <main className="pb-24 animate-page-fade-in">{children}</main>
      <BottomNav />
      <PageReveal />
    </div>
  );
}

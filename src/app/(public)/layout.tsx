import { BottomNav } from "@/components/BottomNav";
import { HandDrawnFilters } from "@/components/HandDrawnFilters";
import { SketchFilter } from "@/components/SketchFilter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <HandDrawnFilters />
      <SketchFilter />
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}

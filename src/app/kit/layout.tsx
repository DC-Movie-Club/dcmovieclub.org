import { notFound } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { PageReveal } from "@/components/PageReveal";
import { SketchFilter } from "@/components/SketchFilter";
import { WatercolorFilter } from "@/components/WatercolorFilter";
import { kitAccents, kitBackgrounds } from "@/app/kit/fixtures";

// Every page drawn from fixtures under the public site's chrome, for checking
// the design system by eye and by screenshot (see tests/kit.spec.ts). Only in
// development.
export default function KitLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SketchFilter />
      <WatercolorFilter />
      <main className="pb-24 animate-page-fade-in">{children}</main>
      <BottomNav accents={kitAccents} backgrounds={kitBackgrounds} />
      <PageReveal />
    </div>
  );
}

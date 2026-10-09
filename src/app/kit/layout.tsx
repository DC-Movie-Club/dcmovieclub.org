import { notFound } from "next/navigation";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { kitAccents, kitBackgrounds } from "@/app/kit/fixtures";

// Every page drawn from fixtures under the public site's chrome, for checking
// the design system by eye and by screenshot (see tests/kit.spec.ts). Only in
// development.
export default function KitLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <PublicChrome accents={kitAccents} backgrounds={kitBackgrounds}>
      {children}
    </PublicChrome>
  );
}

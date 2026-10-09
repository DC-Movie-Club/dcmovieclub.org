import { PublicChrome } from "@/components/layout/PublicChrome";
import { getPageAccents, getPageBackgrounds } from "@/lib/pages";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicChrome
      accents={await getPageAccents()}
      backgrounds={await getPageBackgrounds()}
    >
      {children}
    </PublicChrome>
  );
}

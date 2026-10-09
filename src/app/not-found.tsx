import { PublicChrome } from "@/components/layout/PublicChrome";
import { NotFoundPage } from "@/components/pages/NotFoundPage";
import { getPageAccents, getPageBackgrounds } from "@/lib/pages";

// Outside the public layout, so it brings the public chrome itself
export default async function NotFound() {
  return (
    <PublicChrome
      accents={await getPageAccents()}
      backgrounds={await getPageBackgrounds()}
    >
      <NotFoundPage />
    </PublicChrome>
  );
}

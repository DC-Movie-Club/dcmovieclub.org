import { Link } from "@/components/ui/link";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { getPageAccents, getPageBackgrounds } from "@/lib/pages";

// Outside the public layout, so it brings the public chrome itself
export default async function NotFound() {
  return (
    <PublicChrome
      accents={await getPageAccents()}
      backgrounds={await getPageBackgrounds()}
    >
      {/* Centered above the space kept clear for the nav */}
      <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">Page not found.</p>
        <Link
          href="/"
          className="mt-8 text-sm underline underline-offset-4"
        >
          Go home
        </Link>
      </div>
    </PublicChrome>
  );
}

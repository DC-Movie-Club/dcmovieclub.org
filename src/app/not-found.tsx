import { Link } from "@/components/ui/link";
import { BottomNav } from "@/components/BottomNav";
import { getPageAccents, getPageBackgrounds } from "@/lib/pages";

export default async function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">Page not found.</p>
        <Link
          href="/"
          className="mt-8 text-sm underline underline-offset-4"
        >
          Go home
        </Link>
      </div>
      <BottomNav
        accents={await getPageAccents()}
        backgrounds={await getPageBackgrounds()}
      />
    </div>
  );
}

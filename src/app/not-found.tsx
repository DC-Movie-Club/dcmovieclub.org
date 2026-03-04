import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-muted-foreground">Page not found.</p>
      <Link
        href="/"
        className="mt-8 text-sm underline underline-offset-4 hover:text-primary"
      >
        Go home
      </Link>
    </div>
  );
}

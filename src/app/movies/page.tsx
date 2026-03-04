import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
};

export default function Movies() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Movies</h1>
      <p className="mt-4 text-muted-foreground">Coming soon.</p>
    </div>
  );
}

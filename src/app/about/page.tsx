import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>DC Movie Club is a community of film lovers based in Washington, DC.</p>
      </div>
    </div>
  );
}

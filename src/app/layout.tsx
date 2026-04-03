import type { Metadata } from "next";
import "@/styles/globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "DC Movie Club",
  description: "A community of film lovers in Washington, DC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

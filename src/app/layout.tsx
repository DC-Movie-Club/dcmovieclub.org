import type { Metadata } from "next";
import "@/styles/globals.css";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: {
    default: "DC Movie Club",
    template: "%s | DC Movie Club",
  },
  description:
    "A community of film lovers in Washington, DC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TopNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
